import assert from 'node:assert/strict'
import { Controller } from './diagnosis-fixture/controller.mjs'
import { TaskView } from './diagnosis-fixture/client.mjs'

// This is an intentionally faulty application, not production code or a proposed fix.
const controller = new Controller()
const view = new TaskView('tab-7', controller)
assert.equal(view.open('alpha').length, 1)
assert.deepEqual(view.open('beta'), [])
assert.equal(controller.latest('beta').items.length, 2)
controller.clearCache()
assert.deepEqual(view.refresh(), [])
const fresh = new TaskView('tab-8', controller)
assert.equal(fresh.open('beta').length, 2)
assert.deepEqual(fresh.refresh(), [])
assert.equal(controller.pool.forConnection('tab-7').after, 41)
assert.equal(controller.pool.forConnection('tab-8').after, 4)
console.log('Fixture confirmed: persisted data remains; clearing cache does not recover; fresh connection temporarily recovers; same-tenant refresh also fails.')
