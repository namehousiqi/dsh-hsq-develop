import { withSkillPolicy } from './skill-policy-core.js'

/** Instantiate a private registry using the Host's actual Service class, avoiding duplicate runtime dependencies. */
export function apply(ctx, config = {}) {
  const hostRegistry = ctx.root.get('skills')
  if (!hostRegistry || typeof hostRegistry.constructor !== 'function') {
    throw new Error('HSQ skill policy requires the Host skill registry')
  }
  const PolicyRegistry = withSkillPolicy(hostRegistry.constructor)
  new PolicyRegistry(ctx, config)
}
