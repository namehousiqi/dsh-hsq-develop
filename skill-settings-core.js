import { coreSkills } from './skill-policy-core.js'

export const initialExternalSkills = Object.freeze(['ui-ux-pro-max', 'archify', 'ego-browser', 'choerodon-kanban'])
const core = new Set(coreSkills)

export function normalizeSelections(value) {
  if (!Array.isArray(value) || value.length > 300) throw new Error('技能列表必须为数组，最多 300 项 / Expected up to 300 skills')
  const seen = new Set()
  return value.map(row => {
    if (!row || typeof row !== 'object' || typeof row.name !== 'string' || row.name.length > 160 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.name) || typeof row.enabled !== 'boolean') throw new Error('技能名称或启用状态无效 / Invalid skill selection')
    if (core.has(row.name)) throw new Error('内置工作流不可作为外部技能配置 / Built-in workflows are protected')
    if (seen.has(row.name)) throw new Error('技能名称重复 / Duplicate skill name')
    seen.add(row.name)
    return { name: row.name, enabled: row.enabled }
  })
}

export function effectiveSelections(config, defaults = initialExternalSkills) {
  return normalizeSelections(config.externalSkills ?? defaults.map(name => ({ name, enabled: true })))
}

export function revisionOf(selections) {
  return JSON.stringify(normalizeSelections(selections))
}

/** Copy the complete current bundled definition; only replace its private skill policy. */
export function configurePreset(definition, selections, revision) {
  const copy = structuredClone(definition)
  let found = 0
  function visit(rows) {
    for (const row of rows) {
      if (row.id === 'hsq-skill-policy') {
        row.config = { ...row.config, additionalSkills: selections.filter(s => s.enabled).map(s => s.name), allowAllSkills: false, managementRevision: revision }
        found++
      }
      if (row.group && Array.isArray(row.config)) visit(row.config)
    }
  }
  visit(copy.plugins)
  if (found !== 1) throw new Error('预设技能策略缺失或重复 / Expected one private skill policy')
  return copy
}

export function summarizeCatalog(snapshot) {
  return {
    complete: snapshot.complete,
    skills: snapshot.skills.filter(s => !core.has(s.name)).map(s => ({ name: s.name, description: s.description, source: s.source })),
  }
}
