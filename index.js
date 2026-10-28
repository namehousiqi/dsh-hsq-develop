import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { apply as applySettings, inject as settingsServices } from './skill-settings-runtime.js'

export const name = 'hsq-development-workflows'
export const inject = ['skills']

const names = ['design', 'diagnose', 'implement', 'database', 'review', 'git', 'step', 'deliver']

/** Read all workflow resources before registering so missing assets fail without a partial catalog. */
export function loadWorkflows() {
  return names.map(suffix => {
    const skillName = `hsq-dev-${suffix}`
    const base = new URL(`./skills/${skillName}/`, import.meta.url)
    const path = fileURLToPath(new URL('SKILL.md', base))
    const source = readFileSync(path, 'utf8')
    // Package-owned frontmatter uses a deliberately narrow, single-line JSON string description.
    const match = source.match(/^---\r?\nname: ([a-z0-9-]+)\r?\ndescription: ("[^\r\n]*")\r?\n---\r?\n/)
    if (!match || match[1] !== skillName) throw new Error(`Invalid workflow frontmatter: ${path}`)
    const description = JSON.parse(match[2])
    if (typeof description !== 'string' || !description.trim()) throw new Error(`Missing workflow description: ${path}`)
    return {
      name: skillName,
      description,
      source: 'runtime',
      path,
      resourceBase: { kind: 'directory', path: fileURLToPath(base) },
      content: source.slice(match[0].length),
    }
  })
}

/** Register only in the selecting preset's scope; dispose all registrations on unload or rollback. */
export function apply(ctx, config = {}) {
  // The Host row owns the settings UI; scoped rows only register the eight workflows.
  if (config.settingsUI === true) return ctx.inject(settingsServices, child => applySettings(child, config))
  const workflows = loadWorkflows()
  return ctx.effect(() => {
    const disposers = []
    try {
      for (const workflow of workflows) disposers.push(ctx.skills.register(workflow))
    } catch (error) {
      for (const dispose of disposers.reverse()) dispose()
      throw error
    }
    return () => {
      for (const dispose of disposers.reverse()) dispose()
    }
  })
}
