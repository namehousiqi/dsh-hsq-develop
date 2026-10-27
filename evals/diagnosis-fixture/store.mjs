const events = {
  alpha: [{ seq: 40, task: { id: 'a-1', state: 'running' } }, { seq: 41, task: { id: 'a-1', state: 'done' } }],
  beta: [{ seq: 3, task: { id: 'b-1', state: 'running' } }, { seq: 4, task: { id: 'b-2', state: 'done' } }],
}
export function listTasks(tenant) {
  const byId = new Map()
  for (const { task } of events[tenant] ?? []) byId.set(task.id, { ...task })
  return [...byId.values()]
}
export function readEvents(tenant, after) {
  return (events[tenant] ?? []).filter(event => event.seq > after).map(event => ({ ...event, task: { ...event.task } }))
}
