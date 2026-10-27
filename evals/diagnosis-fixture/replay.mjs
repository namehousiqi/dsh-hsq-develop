import { readEvents } from './store.mjs'
export class ReplayPool {
  constructor() { this.readers = new Map() }
  forConnection(connectionId) {
    if (!this.readers.has(connectionId)) this.readers.set(connectionId, { after: 0 })
    return this.readers.get(connectionId)
  }
  pull(connectionId, tenant) {
    const reader = this.forConnection(connectionId)
    const batch = readEvents(tenant, reader.after)
    for (const event of batch) reader.after = Math.max(reader.after, event.seq)
    return batch
  }
}
