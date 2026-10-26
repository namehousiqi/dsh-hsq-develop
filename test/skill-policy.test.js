import { test } from 'node:test'
import assert from 'node:assert/strict'
import { coreSkills, withSkillPolicy } from '../skill-policy-core.js'

class Registry {
  constructor() { this.items = [...coreSkills, 'ego-browser', 'hsq-develop', 'frontend-design'].map(name => ({ name })) }
  async snapshot() { return { skills: this.items, complete: false } }
  async list(options) { return (await this.snapshot(options)).skills }
  async get(name) { return this.items.find(s => s.name === name) }
}
const Policy = withSkillPolicy(Registry)

test('default policy keeps eight workflows and blocks external discovery and direct loading', async () => {
  const registry = new Policy({})
  assert.deepEqual((await registry.list()).map(s => s.name), coreSkills)
  assert.equal(await registry.get('hsq-develop'), undefined)
  assert.equal(await registry.get('ego-browser'), undefined)
  assert.ok(await registry.get('hsq-dev-review'))
  assert.equal((await registry.snapshot()).complete, false)
})

test('exact allowlist adds only chosen skills and does not mutate other registry instances', async () => {
  const allowed = new Policy({}, { additionalSkills: ['ego-browser'] })
  const other = new Registry()
  assert.deepEqual((await allowed.list()).map(s => s.name), [...coreSkills, 'ego-browser'])
  assert.ok(await allowed.get('ego-browser'))
  assert.equal(await allowed.get('frontend-design'), undefined)
  assert.ok(await other.get('frontend-design'))
  assert.equal(other.items.length, 11)
})

test('explicit allow-all restores discovery and loading without deleting core workflows', async () => {
  const registry = new Policy({}, { allowAllSkills: true })
  assert.equal((await registry.list()).length, 11)
  assert.ok(await registry.get('hsq-develop'))
})

test('reject invalid wildcard or malformed allowlist entries and retain cancellation', async () => {
  for (const additionalSkills of [['*'], ['Ego Browser'], 'ego-browser', [null]]) {
    assert.throws(() => new Policy({}, { additionalSkills }), /exact kebab-case/)
  }
  const signal = AbortSignal.abort(new Error('cancelled'))
  await assert.rejects(new Policy({}).get('blocked', { signal }), /cancelled/)
})
