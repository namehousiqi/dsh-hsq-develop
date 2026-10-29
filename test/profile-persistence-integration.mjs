// Optional integration with the installed Config Editor. All writes stay in a unique temporary fixture.
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, writeFile, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, basename, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
const runtimeDir = process.env.DSH_RUNTIME_DIR
if (!runtimeDir) throw new Error('Set DSH_RUNTIME_DIR to the installed dsh directory')
const base = pathToFileURL(runtimeDir.replace(/\/$/, '') + '/')
const runtime = name => import(new URL(`node_modules/@deepseek-ai/${name}/lib/index.js`, base))
const { Context } = await runtime('cordis')
const { Loader } = await runtime('cordis-plugin-loader')
const { default: Skills } = await runtime('dsh-skill')
const { default: Presets } = await runtime('dsh-agent-preset-registry')
const { default: ConfigEditor } = await runtime('dsh-config-editor')
const { mountRootInclude, readProfilePatches, reconcileProfilePatches } = await runtime('dsh-app-boot')
const { createScope, scopeOf } = await runtime('dsh-scope')
const file = relative => new URL(relative, import.meta.url).href
const directory = await mkdtemp(join(tmpdir(), 'hsq-skill-profile-test-'))
const ownedDirectory = await realpath(directory)
const profileDir = join(directory, 'profile')
const fixtureBundleDir = join(profileDir, 'node_modules', '@test', 'hsq-skill-fixture')
const profile = { dir: profileDir, home: directory, installAnchor: join(runtimeDir, 'package.json'), patchPath: join(profileDir, 'cordis.patch.yml'), overlays: [] }
const configPath = join(directory, 'root.yml')
let root, lease
const makeDefinition = label => ({
  id: 'hsq-develop', name: label, plugins: [{ id: 'hsq-skills', name: 'cordis:group', group: true, isolate: { skills: true }, config: [
    { id: 'hsq-skill-policy', name: file('../skill-policy-runtime.js') },
    { id: 'workflows', name: file('../index.js') },
    { id: 'external-fixture', name: file('./runtime-provider.mjs') },
  ] }],
})
async function writeBundle(label) {
  const rows = [{ insert: [
    { id: 'hsq-skill-settings', name: file('../index.js'), config: { settingsUI: true } },
    { id: 'preset-hsq-develop', name: file('../preset-runtime.js'), config: makeDefinition(label) },
  ] }]
  await writeFile(join(fixtureBundleDir, 'patch.yml'), JSON.stringify(rows))
}
async function bootFixture() {
  const ctx = new Context()
  ctx.provide('sessionProjections', { register() {} })
  ctx.provide('webServer', { register: () => () => {} })
  ctx.provide('connection', { admit: () => ({ peer: { principal: { kind: 'owner' } } }) })
  ctx.provide('profileContext', profile)
  await ctx.plugin(Loader, { baseUrl: import.meta.url }).await()
  await ctx.plugin(Skills).await()
  await ctx.plugin(Presets, { default: 'hsq-develop' }).await()
  await ctx.plugin(ConfigEditor).await()
  await mountRootInclude(ctx, configPath, readProfilePatches('hsq-test', profile))
  await ctx.loader.await()
  assert.equal((await ctx.agentPresets.resolve('hsq-develop')).broken, undefined)
  return ctx
}
try {
  await mkdir(fixtureBundleDir, { recursive: true })
  await writeFile(join(profileDir, 'package.json'), JSON.stringify({ name: 'hsq-test-profile', private: true, dsh: { profile: { bundles: ['@test/hsq-skill-fixture'] } } }))
  await writeFile(join(fixtureBundleDir, 'package.json'), JSON.stringify({ name: '@test/hsq-skill-fixture', version: '1.0.0', dsh: { bundle: { patch: './patch.yml' } } }))
  await writeFile(profile.patchPath, '[]\n')
  await writeFile(configPath, '[]\n')
  await writeBundle('Original bundled preset')
  root = await bootFixture()
  const first = await root.hsqSkillSettings.view()
  assert.equal(first.selections.length, 4)
  const selections = [{ name: 'archify', enabled: false }, { name: 'not-selected', enabled: true }, { name: 'missing-skill', enabled: true }]
  await root.hsqSkillSettings.save({ selections, revision: first.revision })
  assert.deepEqual((await root.hsqSkillSettings.view()).selections, selections)
  const savedPatch = await readFile(profile.patchPath, 'utf8')
  assert.match(savedPatch, /externalSkills:/)
  assert.doesNotMatch(savedPatch, /plugins:|preset-hsq-develop|Original bundled preset/)
  assert.equal(await readFile(configPath, 'utf8'), '[]\n', 'The root Include remains unchanged')
  await root.fiber.dispose()
  root = await bootFixture()
  assert.deepEqual((await root.hsqSkillSettings.view()).selections, selections, 'Choices survive a full runtime restart')
  lease = createScope(root, {})
  await root.agentPresets.mount(lease.ctx, 'hsq-develop')
  const skills = root.agentPresets.serviceFor({ ctx: lease.ctx }, 'skills')
  const options = { scope: scopeOf(lease.ctx) }
  assert.equal(await skills.get('archify', options), undefined)
  assert.ok(await skills.get('not-selected', options))
  assert.ok(await skills.get('hsq-dev-review', options))
  assert.ok((await skills.get('hsq-dev-product-ui', options)).content)
  await lease.dispose(); lease = undefined
  await writeBundle('Upgraded bundled rules')
  await reconcileProfilePatches(root, readProfilePatches('hsq-test', profile), 'hsq-test')
  assert.equal((await root.agentPresets.list()).find(preset => preset.id === 'hsq-develop').name, 'Upgraded bundled rules')
  assert.deepEqual((await root.hsqSkillSettings.view()).selections, selections, 'Bundle upgrades retain personal choices')
  assert.equal(await readFile(profile.patchPath, 'utf8'), savedPatch)
  console.log('PASS: native Config Editor disk persistence, restart, disabled/missing selections and bundle-upgrade independence')
} finally {
  await lease?.dispose()
  await root?.fiber.dispose()
  const resolved = await realpath(directory)
  assert.equal(resolved, ownedDirectory)
  assert.equal(dirname(resolved), await realpath(tmpdir()))
  assert.ok(basename(resolved).startsWith('hsq-skill-profile-test-'))
  await rm(resolved, { recursive: true, force: true })
}
