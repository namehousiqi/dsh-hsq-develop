import { withSkillPolicy } from './skill-policy-core.js'

/** Instantiate a private registry using the Host's actual Service class, avoiding duplicate runtime dependencies. */
export function apply(ctx, config = {}) {
  const hostRegistry = ctx.root.get('skills')
  if (!hostRegistry || typeof hostRegistry.constructor !== 'function') {
    throw new Error('HSQ skill policy requires the Host skill registry')
  }
  const PolicyRegistry = withSkillPolicy(hostRegistry.constructor)
  const registry = new PolicyRegistry(ctx, config)
  const manager = ctx.root.get('hsqSkillSettings')
  if (manager && config.managementRevision) {
    ctx.effect(() => manager.registerCatalog(config.managementRevision, options => hostRegistry.constructor.prototype.snapshot.call(registry, options)))
  }
}
