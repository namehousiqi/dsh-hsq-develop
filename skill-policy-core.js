export const coreSkills = Object.freeze(
  ['design', 'diagnose', 'implement', 'database', 'review', 'git', 'step', 'deliver'].map(name => `hsq-dev-${name}`),
)

/** Keep discovery and both invocation paths on one policy without mutating provider data. */
export function withSkillPolicy(Registry) {
  return class extends Registry {
    constructor(ctx, config = {}) {
      super(ctx, config)
      const extras = config.additionalSkills ?? []
      if (!Array.isArray(extras) || extras.some(name => typeof name !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name))) {
        throw new Error('additionalSkills must contain exact kebab-case skill names')
      }
      this.allowedSkills = new Set([...coreSkills, ...extras])
      this.allowAllSkills = config.allowAllSkills === true
    }

    allowsSkill(name) {
      return this.allowAllSkills || this.allowedSkills.has(name)
    }

    async snapshot(options = {}) {
      const snapshot = await super.snapshot(options)
      return { ...snapshot, skills: snapshot.skills.filter(skill => this.allowsSkill(skill.name)) }
    }

    async get(name, options = {}) {
      options.signal?.throwIfAborted()
      if (!this.allowsSkill(name)) return undefined
      return super.get(name, options)
    }
  }
}
