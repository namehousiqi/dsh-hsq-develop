export const inject = ['skills']
export function apply(ctx) {
  for (const name of ['archify', 'not-selected']) ctx.effect(() => ctx.skills.register({ name, description: name, source: 'runtime', content: name }))
}
