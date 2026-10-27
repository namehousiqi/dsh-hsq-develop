import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Controller } from './controller.mjs'
import { TaskView } from './client.mjs'

test('a new view receives stored tasks for each workspace', () => {
  for (const tenant of ['alpha', 'beta']) {
    const service = new Controller()
    const view = new TaskView(`fresh-${tenant}`, service)
    assert.deepEqual(view.open(tenant), service.latest(tenant).items)
  }
})

test('workspace latest cache can be invalidated', () => {
  const service = new Controller()
  service.latest('beta')
  service.clearCache()
  assert.equal(service.latest('beta').cached, false)
})
