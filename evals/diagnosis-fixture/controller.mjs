import { listTasks } from './store.mjs'
import { ReplayPool } from './replay.mjs'
export class Controller {
  constructor() { this.pool = new ReplayPool(); this.cache = new Map() }
  latest(tenant) {
    const cached = this.cache.get(tenant)
    if (cached) return { items: cached, cached: true }
    const items = listTasks(tenant)
    this.cache.set(tenant, items)
    return { items, cached: false }
  }
  clearCache() { this.cache.clear() }
  recover(connectionId, tenant) {
    return { events: this.pool.pull(connectionId, tenant) }
  }
}
