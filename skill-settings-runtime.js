import { isAbsolute } from 'node:path'
import { coreSkills } from './skill-policy-core.js'
import { effectiveSelections, normalizeSelections, revisionOf, summarizeCatalog } from './skill-settings-core.js'

export const inject = ['configEditor', 'agentPresets', 'webServer', 'connection']
const BASE = '/api/hsq-develop/skills'
function send(res, status, value) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(value))
}
export async function readBody(req) {
  let size = 0
  const chunks = []
  for await (const chunk of req) {
    size += Buffer.byteLength(chunk)
    if (size > 65536) throw new Error('请求过大 / Request too large')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks.map(c => Buffer.from(c))).toString('utf8'))
}

export function createManager(ctx, config) {
  const root = ctx.root
  const presets = ctx.agentPresets
  const editor = ctx.configEditor
  const selections = effectiveSelections(config)
  const revision = revisionOf(selections)
  const catalogs = new Map()
  let activeRevision, resolveReady, rejectReady
  const ready = new Promise((resolve, reject) => { resolveReady = resolve; rejectReady = reject })
  ready.catch(() => {}) // Startup failures also surface through the native Loader diagnostic.
  return {
    current: () => structuredClone(selections),
    async whenReady() {
      let timer
      try { await Promise.race([ready, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('预设启用尚未完成，请刷新检查 / Activation is still pending; reload to check')), 15000) })]) }
      finally { clearTimeout(timer) }
    },
    fail: error => rejectReady(error),
    activate: value => { activeRevision = value; resolveReady() },
    deactivate: value => { if (activeRevision === value) activeRevision = undefined },
    registerCatalog(token, read) {
      catalogs.set(token, read)
      return () => { if (catalogs.get(token) === read) catalogs.delete(token) }
    },
    async view(cwd) {
      if (cwd !== undefined && (typeof cwd !== 'string' || !isAbsolute(cwd))) throw new Error('请选择绝对项目目录 / Select an absolute project directory')
      const read = catalogs.get(activeRevision)
      if (!read) throw new Error('预设尚未就绪，请稍后刷新 / Preset is not ready; retry shortly')
      const lease = await presets.acquireScope('hsq-develop')
      try {
        const catalog = summarizeCatalog(await read({ scope: lease.key, signal: AbortSignal.timeout(15000), ...(cwd ? { cwd } : {}) }))
        return { selections: structuredClone(selections), revision, coreSkills, ...catalog, cwd: cwd ?? null }
      } finally { await lease[Symbol.asyncDispose]() }
    },
    async save(input) {
      const next = normalizeSelections(input.selections)
      if (input.revision !== revision) throw Object.assign(new Error('配置已被其他页面修改，请刷新后重试 / Settings changed elsewhere; reload first'), { status: 409 })
      const entry = editor.entries().find(e => e.options.id === 'hsq-skill-settings')
      if (!entry) throw new Error('找不到技能配置入口 / Settings entry unavailable')
      await editor.edit(entry, current => {
        if (revisionOf(effectiveSelections(current)) !== input.revision) throw Object.assign(new Error('配置已变化，请刷新 / Settings changed; reload first'), { status: 409 })
        return { ...current, externalSkills: next }
      })
      // Service dependency reload can finish after profile reconciliation returns.
      // Wait for the new owner, rather than reporting success while its preset is absent.
      const nextManager = root.get('hsqSkillSettings')
      if (!nextManager) throw Object.assign(new Error('已保存，配置正在重新加载，请刷新检查 / Saved; settings are reloading. Refresh to check'), { status: 503 })
      await nextManager.whenReady()
      const preset = await presets.resolve('hsq-develop')
      if (preset.broken) throw Object.assign(new Error(`已保存，但预设启用失败 / Saved, but activation failed: ${preset.broken}`), { status: 503 })
      return { saved: true, applies: 'new-sessions', selections: next, revision: revisionOf(next) }
    },
  }
}

/** User-only settings mutations: they change which skill instructions Agents may load. */
export function createRoute(ctx, manager) {
  return { kind: 'exact', path: BASE, handler: async (req, res) => {
    const admission = ctx.connection.admit(req)
    if ('rejection' in admission) return send(res, admission.rejection, { error: '未授权 / Unauthorized' })
    if (admission.peer.principal.kind !== 'owner') return send(res, 403, { error: '仅用户可管理技能 / Owner access required' })
    try {
      if (req.method === 'GET') {
        const cwd = new URL(req.url, 'http://localhost').searchParams.get('cwd') || undefined
        return send(res, 200, await manager.view(cwd))
      }
      if (req.method !== 'POST') return send(res, 405, { error: '不支持此方法 / Method not allowed' })
      if (!req.headers['content-type']?.toLowerCase().startsWith('application/json')) return send(res, 415, { error: '需要 JSON 请求 / JSON required' })
      return send(res, 200, await manager.save(await readBody(req)))
    } catch (error) { send(res, error.status ?? 400, { error: error.message }) }
  } }
}

export function apply(ctx, config = {}) {
  const manager = createManager(ctx, config)
  ctx.provide('hsqSkillSettings', manager)
  ctx.effect(() => ctx.webServer.register(createRoute(ctx, manager)))
}
