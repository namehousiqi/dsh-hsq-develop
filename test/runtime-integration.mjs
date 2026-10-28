// Optional integration against the installed Harness runtime; no server or profile writes.
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
const runtimeDir = process.env.DSH_RUNTIME_DIR
if (!runtimeDir) throw new Error('Set DSH_RUNTIME_DIR to the installed dsh directory')
const base = pathToFileURL(runtimeDir.replace(/\/$/, '') + '/')
const runtime = async name => import(new URL(`node_modules/@deepseek-ai/${name}/lib/index.js`, base))
const { Context } = await runtime('cordis')
const { Loader, Group } = await runtime('cordis-plugin-loader')
const { default: Skills } = await runtime('dsh-skill')
const { default: Presets } = await runtime('dsh-agent-preset-registry')
const { createScope, scopeOf } = await runtime('dsh-scope')
const file = relative => new URL(relative, import.meta.url).href
const root = new Context()
let persisted = { settingsUI: true }
let routes = new Map()
let oldAgent, newAgent
try {
  root.provide('sessionProjections', { register() {} })
  root.provide('webServer', { register(route) { routes.set(route.path, route); return () => routes.delete(route.path) } })
  root.provide('connection', { admit: () => ({ peer: { principal: { kind: 'owner' } } }) })
  root.provide('configEditor', {
    entries: () => [...root.loader.entries()],
    async edit(entry, change) {
      persisted = change(persisted)
      await entry.update({ ...entry.options, config: persisted }, true)
      // A real config editor waits for reconciliation; wait for the dependent owner too.
      await root.loader.await()
    },
  })
  await root.plugin(Loader, { baseUrl: import.meta.url }).await()
  root.loader.builtins.group = Group
  await root.plugin(Skills).await()
  await root.plugin(Presets, { default: 'hsq-develop' }).await()
  await root.loader.create({ id: 'hsq-skill-settings', name: file('../index.js'), config: persisted })
  await root.loader.create({ id: 'preset-hsq-develop', name: file('../preset-runtime.js'), config: {
    id: 'hsq-develop', plugins: [{ id: 'hsq-skills', name: 'cordis:group', group: true, isolate: { skills: true }, config: [
      { id: 'hsq-skill-policy', name: file('../skill-policy-runtime.js') },
      { id: 'workflows', name: file('../index.js') },
      { id: 'external-fixture', name: file('./runtime-provider.mjs') },
    ] }],
  } })
  const metadata = await root.agentPresets.resolve('hsq-develop')
  assert.equal(metadata.broken, undefined, metadata.broken)
  const state = await root.hsqSkillSettings.view()
  assert.deepEqual(state.skills.map(s => s.name).sort(), ['archify', 'not-selected'])
  assert.equal(state.selections.length, 4)
  assert.equal(routes.size, 1)
  assert.equal((await root.skills.list()).length, 0, 'No workflows leak into the root registry')
  oldAgent = createScope(root, {})
  await root.agentPresets.mount(oldAgent.ctx, 'hsq-develop')
  const oldSkills = root.agentPresets.serviceFor({ ctx: oldAgent.ctx }, 'skills')
  assert.equal((await oldSkills.list({ scope: scopeOf(oldAgent.ctx) })).length, 9)
  assert.ok(await oldSkills.get('archify', { scope: scopeOf(oldAgent.ctx) }))
  assert.equal(await oldSkills.get('not-selected', { scope: scopeOf(oldAgent.ctx) }), undefined)
  await root.hsqSkillSettings.save({ selections: [], revision: state.revision })
  assert.deepEqual(persisted, { settingsUI: true, externalSkills: [] })
  assert.deepEqual((await root.hsqSkillSettings.view()).selections, [])
  newAgent = createScope(root, {})
  await root.agentPresets.mount(newAgent.ctx, 'hsq-develop')
  const newSkills = root.agentPresets.serviceFor({ ctx: newAgent.ctx }, 'skills')
  assert.equal((await newSkills.list({ scope: scopeOf(newAgent.ctx) })).length, 8)
  assert.equal(await newSkills.get('archify', { scope: scopeOf(newAgent.ctx) }), undefined)
  assert.ok(await oldSkills.get('archify', { scope: scopeOf(oldAgent.ctx) }), 'The retained Agent still uses the old revision')
  assert.equal((await root.skills.list()).length, 0)
  assert.equal(routes.size, 1, 'The retired HTTP route was replaced, not duplicated')
  console.log('PASS: real Cordis mount, unfiltered discovery, save/reload, private isolation and retained revisions')
} finally {
  await newAgent?.dispose()
  await oldAgent?.dispose()
  await root.fiber.dispose()
}
