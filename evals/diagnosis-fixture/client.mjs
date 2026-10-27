export class TaskView {
  constructor(connectionId, controller) { this.connectionId = connectionId; this.controller = controller; this.tasks = new Map() }
  open(tenant) {
    this.tenant = tenant
    this.tasks.clear()
    for (const event of this.controller.recover(this.connectionId, tenant).events) this.tasks.set(event.task.id, event.task)
    return this.visible()
  }
  refresh() { return this.open(this.tenant) }
  visible() { return [...this.tasks.values()] }
}
