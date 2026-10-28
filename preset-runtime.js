import { randomUUID } from 'node:crypto'
import { configurePreset } from './skill-settings-core.js'

/** Preserve Loader expressions, just as the shipped declarative preset owner does. */
export default class ManagedPreset {
  static inject = ['agentPresets', 'hsqSkillSettings']
  static [Symbol.for('cordis.group')] = true
  constructor(ctx, config) { this.ctx = ctx; this.config = config }
  async *[Symbol.for('cordis.init')]() {
    const settings = this.ctx.hsqSkillSettings
    const revision = randomUUID()
    const definition = configurePreset(this.config, settings.current(), revision)
    try {
      const dispose = await this.ctx.agentPresets.register(definition)
      settings.activate(revision)
      yield async () => { settings.deactivate(revision); await dispose() }
    } catch (error) { settings.fail(error); throw error }
  }
}
