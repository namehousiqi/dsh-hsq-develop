import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { configurePreset, effectiveSelections, normalizeSelections, initialExternalSkills, revisionOf } from '../skill-settings-core.js'
import { createManager, createRoute, readBody } from '../skill-settings-runtime.js'
import { withSkillPolicy } from '../skill-policy-core.js'
import ManagedPreset from '../preset-runtime.js'

const selection = [{ name: 'choerodon-kanban', enabled: true }, { name: 'archify', enabled: false }]
const definition = {
  id: 'hsq-develop', plugins: [
    { id: 'persona', name: 'persona', config: { prefix: 'current bundled rules' } },
    { id: 'group', name: 'cordis:group', group: true, config: [
      { id: 'hsq-skill-policy', name: 'policy', config: { additionalSkills: ['old-default'], allowAllSkills: true } },
      { id: 'shell', name: 'bash', disabled: { __jsExpr: "process.platform === 'win32'" } },
    ] },
  ],
}

test('migration keeps all four selections; disabled and removed entries persist distinctly', () => {
  assert.deepEqual(effectiveSelections({}).map(s => s.name), [...initialExternalSkills])
  assert.deepEqual(effectiveSelections({ externalSkills: [] }), [])
  assert.deepEqual(effectiveSelections({ externalSkills: selection }), selection)
  for (const rows of [[{ name: 'hsq-dev-review', enabled: false }], [...selection, selection[0]], [{ name: '../evil', enabled: true }], [{ name: 'archify', enabled: 'yes' }]]) assert.throws(() => normalizeSelections(rows))
})

test('policy generations keep old sessions unchanged and protect built-ins', () => {
  const old = configurePreset(definition, selection, 'old')
  const next = configurePreset(definition, [], 'next')
  const config = d => d.plugins[1].config[0].config
  const Registry = withSkillPolicy(class {})
  const oldPolicy = new Registry({}, config(old)), nextPolicy = new Registry({}, config(next))
  assert.equal(oldPolicy.allowsSkill('choerodon-kanban'), true)
  assert.equal(oldPolicy.allowsSkill('archify'), false)
  assert.equal(nextPolicy.allowsSkill('choerodon-kanban'), false)
  assert.equal(nextPolicy.allowsSkill('hsq-dev-review'), true)
  assert.equal(oldPolicy.allowsSkill('choerodon-kanban'), true)
  assert.equal(old.plugins[0].config.prefix, 'current bundled rules')
  assert.deepEqual(old.plugins[1].config[1].disabled, definition.plugins[1].config[1].disabled)
  assert.equal(definition.plugins[1].config[0].config.allowAllSkills, true)
})

function fixture(config = {}) {
  let persisted = structuredClone(config), disposed = 0
  const entry = { options: { id: 'hsq-skill-settings' } }
  const ctx = {
    root: { get: () => ({ whenReady: async () => {} }) },
    configEditor: {
      entries: () => [entry],
      async edit(e, change) { assert.equal(e, entry); persisted = change(persisted); ctx.agentPresets = undefined },
    },
    agentPresets: {
      acquireScope: async () => ({ key: 'scope', [Symbol.asyncDispose]: async () => { disposed++ } }),
      resolve: async () => ({ id: 'hsq-develop' }),
    },
  }
  return { ctx, manager: createManager(ctx, config), persisted: () => persisted, disposed: () => disposed, setPersisted: value => { persisted = value } }
}

test('saving persists only personal choices and survives its own service reload', async () => {
  const f = fixture()
  const result = await f.manager.save({ selections: selection, revision: revisionOf(f.manager.current()) })
  assert.equal(result.applies, 'new-sessions')
  assert.deepEqual(f.persisted(), { externalSkills: selection })
  assert.equal(f.persisted().plugins, undefined)
  const reloaded = fixture(f.persisted())
  assert.deepEqual(reloaded.manager.current(), selection)
  await assert.rejects(reloaded.manager.save({ selections: [], revision: 'stale' }), /配置已/)
})

test('concurrent save rechecks disk state inside the serialized config mutation', async () => {
  const f = fixture()
  f.setPersisted({ externalSkills: selection })
  await assert.rejects(f.manager.save({ selections: [], revision: revisionOf(f.manager.current()) }), /配置已变化/)
  assert.deepEqual(f.persisted(), { externalSkills: selection })
})

test('catalog uses unfiltered scoped provider and releases the preset lease on errors', async () => {
  const f = fixture()
  f.manager.activate('v1')
  f.manager.registerCatalog('v1', async options => {
    assert.equal(options.scope, 'scope'); assert.equal(options.cwd, '/project')
    return { complete: false, skills: [{ name: 'hsq-dev-review', description: 'built in' }, { name: 'unselected-skill', description: 'available', source: 'project-agents' }] }
  })
  const view = await f.manager.view('/project')
  assert.deepEqual(view.skills.map(s => s.name), ['unselected-skill'])
  assert.equal(view.complete, false)
  assert.equal(f.disposed(), 1)
  f.manager.registerCatalog('v1', async () => { throw new Error('provider unavailable') })
  await assert.rejects(f.manager.view(), /provider unavailable/)
  assert.equal(f.disposed(), 2)
})

test('managed declaration preserves expression marker and retires its registration', async () => {
  const calls = []
  const owner = new ManagedPreset({
    hsqSkillSettings: { current: () => selection, activate: v => calls.push(['activate', v]), deactivate: v => calls.push(['deactivate', v]) },
    agentPresets: { register: async d => { calls.push(['register', d]); return async () => calls.push(['dispose']) } },
  }, definition)
  const init = owner[Symbol.for('cordis.init')]()
  const { value: dispose } = await init.next()
  assert.equal(ManagedPreset[Symbol.for('cordis.group')], true)
  assert.equal(calls[0][0], 'register')
  await dispose()
  assert.deepEqual(calls.map(c => c[0]), ['register', 'activate', 'deactivate', 'dispose'])
})

test('save does not report success until the replacement owner is ready', async () => {
  const f = fixture()
  let release, entered
  const replacementReady = new Promise(resolve => { release = resolve })
  const waiting = new Promise(resolve => { entered = resolve })
  f.ctx.root.get = () => ({ whenReady: () => { entered(); return replacementReady } })
  let completed = false
  const saving = f.manager.save({ selections: [], revision: revisionOf(f.manager.current()) }).then(result => { completed = true; return result })
  await waiting
  assert.equal(completed, false)
  release()
  assert.equal((await saving).saved, true)
  assert.equal(completed, true)
})

async function invoke(admission, method, body, contentType = 'application/json') {
  let saved = false, status, data
  const route = createRoute({ connection: { admit: () => admission } }, { save: async () => { saved = true; return { saved: true } }, view: async () => ({ selections: selection }) })
  const request = Readable.from(body === undefined ? [] : [body])
  Object.assign(request, { method, url: '/api/hsq-develop/skills', headers: { 'content-type': contentType } })
  await route.handler(request, { writeHead: s => { status = s }, end: raw => { data = JSON.parse(raw) } })
  return { saved, status, data }
}

test('settings HTTP rejects unauthenticated, nonowner and malformed mutations', async () => {
  assert.equal((await invoke({ rejection: 401 }, 'POST', '{}')).status, 401)
  assert.equal((await invoke({ peer: { principal: { kind: 'api' } } }, 'POST', '{}')).status, 403)
  const owner = { peer: { principal: { kind: 'owner' } } }
  assert.equal((await invoke(owner, 'POST', '{}', 'text/plain')).status, 415)
  assert.equal((await invoke(owner, 'POST', '{')).saved, false)
  assert.equal((await invoke(owner, 'DELETE')).status, 405)
  assert.equal((await invoke(owner, 'GET')).status, 200)
  assert.equal((await invoke(owner, 'POST', '{}')).saved, true)
  await assert.rejects(readBody(Readable.from([Buffer.alloc(65537)])), /请求过大/)
})
