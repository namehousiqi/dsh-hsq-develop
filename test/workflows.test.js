import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'
import { loadWorkflows, apply } from '../index.js'

const expected = ['design', 'product-ui', 'diagnose', 'implement', 'database', 'review', 'git', 'step', 'deliver'].map(x => `hsq-dev-${x}`)

test('all nine independent workflows ship with valid loadable resources below pruning threshold', () => {
  const skills = loadWorkflows()
  assert.deepEqual(skills.map(s => s.name), expected)
  for (const skill of skills) {
    assert.ok(skill.description.length > 10)
    assert.ok(skill.content.length > 100)
    assert.ok(skill.content.length + skill.path.length * 2 + 300 < 8192)
    assert.equal(skill.source, 'runtime')
    assert.ok(statSync(skill.path).isFile())
    assert.ok(skill.path.startsWith(skill.resourceBase.path))
    assert.doesNotMatch(skill.content, /\/Users\/|\.agents\/skills\/hsq-develop|\.\.\/.*hsq-develop/)
  }
})

test('registration exposes bodies then removes every workflow on preset disposal', () => {
  const registry = new Map()
  const ctx = {
    effect: fn => fn(),
    skills: { register: s => {
      assert.ok(!registry.has(s.name))
      registry.set(s.name, s)
      return () => registry.delete(s.name)
    } },
  }
  const dispose = apply(ctx)
  assert.deepEqual([...registry.keys()], expected)
  assert.ok(registry.get('hsq-dev-step').content.includes('退出'))
  dispose()
  assert.equal(registry.size, 0)
})

test('failed registration rolls back earlier workflow effects', () => {
  const registry = new Set()
  const ctx = {
    effect: fn => fn(),
    skills: { register: s => {
      if (s.name === 'hsq-dev-review') throw new Error('registry rejected review')
      registry.add(s.name)
      return () => registry.delete(s.name)
    } },
  }
  assert.throws(() => apply(ctx), /registry rejected review/)
  assert.equal(registry.size, 0)
})

test('manifest ships runtime, all deferred bodies, metadata and license without install scripts', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)))
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml')
  assert.ok(pkg.files.includes('skills'))
  assert.ok(pkg.files.includes('THIRD_PARTY_NOTICES.md'))
  for (const forbidden of ['preinstall', 'install', 'postinstall']) assert.equal(pkg.scripts[forbidden], undefined)
  for (const locale of ['en', 'zh']) {
    const data = JSON.parse(readFileSync(new URL(`../locale/${locale}.json`, import.meta.url)))
    assert.ok(data.meta.title)
    assert.ok(data.meta.description)
  }
})
