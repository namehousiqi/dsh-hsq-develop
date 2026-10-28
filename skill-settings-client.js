window.__ModuleLoader__.load({
  id: '@workspace/dsh-hsq-develop',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'hsq-develop-settings'
    const dictionaries = {
      zh: { title: 'HSQ 开发', subtitle: '选择这个预设可以使用的外部技能。', external: '外部技能', add: '添加技能', remove: '移除', enabled: '已启用', disabled: '已停用', missing: '未找到', missingHint: '当前目录中未发现；配置会保留。项目技能可选择对应目录后重新检查。', empty: '还没有添加外部技能。点击“添加技能”从本机目录中选择。', core: '内置工作流', protected: '始终启用，不受外部技能选择影响。', save: '保存并应用', cancel: '取消更改', saved: '已保存，新会话生效。已有会话保留原配置。', scope: '更改仅用于 HSQ 开发；移除不会删除技能文件。', search: '搜索技能名称或说明', noResults: '没有匹配的技能。可刷新目录或选择项目目录。', done: '完成选择', loading: '正在读取技能…', saving: '正在保存…', retry: '重新读取', reload: '刷新目录', project: '选择项目目录', userOnly: '仅用户技能', useUser: '返回用户技能', available: '可添加', added: '已添加', incomplete: '技能目录尚未完整读取，状态暂不能确定；可刷新重试。', unsaved: '有未保存的更改', toggle: '启停技能', description: '技能说明', source: '来源', projectSource: '项目', userSource: '用户', runtimeSource: '运行时', details: '查看说明', failed: '操作失败，请重试。', applying: '新会话生效', count: '项', allAdded: '本机发现的技能均已添加。' },
      en: { title: 'HSQ Development', subtitle: 'Choose the external skills this preset can use.', external: 'External skills', add: 'Add skills', remove: 'Remove', enabled: 'Enabled', disabled: 'Disabled', missing: 'Not found', missingHint: 'Not discovered in this directory. Your selection is retained; choose the project directory to check project skills.', empty: 'No external skills yet. Add skills from your local catalog.', core: 'Built-in workflows', protected: 'Always enabled, independently of external selections.', save: 'Save and apply', cancel: 'Discard changes', saved: 'Saved for new sessions. Existing sessions keep their configuration.', scope: 'Applies only to HSQ Development. Removing a skill does not delete its files.', search: 'Search skill names or descriptions', noResults: 'No matching skills. Refresh or choose a project directory.', done: 'Done', loading: 'Loading skills…', saving: 'Saving…', retry: 'Reload', reload: 'Refresh catalog', project: 'Choose project directory', userOnly: 'User skills only', useUser: 'Back to user skills', available: 'Available', added: 'Added', incomplete: 'Catalog discovery is incomplete. Availability is not yet certain; refresh to retry.', unsaved: 'Unsaved changes', toggle: 'Enable or disable skill', description: 'Description', source: 'Source', projectSource: 'Project', userSource: 'User', runtimeSource: 'Runtime', details: 'View description', failed: 'Operation failed. Please retry.', applying: 'Applies to new sessions', count: 'skills', allAdded: 'All discovered skills have been added.' },
    }
    const CSS = `
.hsq-settings{box-sizing:border-box;max-width:960px;min-width:0;padding:24px;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:1.55}
.hsq-settings *{box-sizing:border-box}.hsq-settings h2{margin:0 0 5px;font-size:20px;font-weight:600}.hsq-settings h3{margin:0;font-size:15px;font-weight:600}.hsq-muted{color:var(--dsw-alias-label-secondary)}.hsq-settings p{margin:4px 0 14px}
.hsq-toolbar,.hsq-actions,.hsq-row,.hsq-footer{display:flex;align-items:center;gap:10px}.hsq-toolbar{justify-content:space-between;flex-wrap:wrap;margin:24px 0 10px}.hsq-actions{flex-wrap:wrap}.hsq-button{min-height:32px;padding:5px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer}.hsq-button:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2)}.hsq-button:disabled{opacity:.45;cursor:not-allowed}.hsq-primary{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary);font-weight:600}.hsq-settings :is(button,input,summary):focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:3px}
.hsq-row{padding:14px 0;border-bottom:1px solid var(--dsw-alias-border-l1)}.hsq-info{flex:1;min-width:0}.hsq-name{font-weight:600;overflow-wrap:anywhere}.hsq-description{margin-top:4px;color:var(--dsw-alias-label-secondary);white-space:pre-wrap;overflow-wrap:anywhere}.hsq-badge{font-size:11px;padding:2px 7px;border:1px solid var(--dsw-alias-border-l1);border-radius:5px;color:var(--dsw-alias-label-secondary)}.hsq-status{font-size:12px;white-space:nowrap}.hsq-success{color:var(--dsw-alias-state-success-primary)}.hsq-warn{color:var(--dsw-alias-state-warn-primary)}.hsq-error{color:var(--dsw-alias-state-error-primary)}
.hsq-switch{display:inline-flex;align-items:center;justify-content:flex-start;width:34px;height:20px;padding:2px;border:1px solid var(--dsw-alias-border-l2);border-radius:20px;background:var(--dsw-alias-bg-layer-2);cursor:pointer;flex-shrink:0}.hsq-switch[aria-checked=true]{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);justify-content:flex-end}.hsq-switch span{width:14px;height:14px;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);border-radius:50%}.hsq-switch:disabled{opacity:.45;cursor:not-allowed}.hsq-small{font-size:12px;min-height:28px;padding:3px 9px}
.hsq-directory{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:12px}.hsq-path{max-width:100%;overflow-wrap:anywhere}.hsq-footer{position:sticky;bottom:0;justify-content:flex-end;padding:16px 0;margin-top:16px;background:var(--dsw-alias-bg-base);border-top:1px solid var(--dsw-alias-border-l1);flex-wrap:wrap}.hsq-footer .hsq-status{margin-right:auto}.hsq-empty{padding:24px 0;color:var(--dsw-alias-label-secondary)}.hsq-core{margin-top:28px}.hsq-core summary{cursor:pointer;font-weight:600}.hsq-core-list{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0}.hsq-picker{margin:12px 0;padding:16px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1)}.hsq-input{width:100%;min-height:36px;padding:7px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit}.hsq-results{max-height:340px;overflow:auto;margin-top:8px}.hsq-option{display:flex;gap:10px;padding:10px 2px;border-bottom:1px solid var(--dsw-alias-border-l1);cursor:pointer}.hsq-option input{accent-color:var(--dsw-alias-brand-primary);margin-top:5px}.hsq-picker-end{display:flex;justify-content:flex-end;margin-top:12px}
@media(max-width:600px){.hsq-settings{padding:16px}.hsq-row{flex-wrap:wrap}.hsq-info{flex-basis:60%}.hsq-row>.hsq-actions{margin-left:auto}.hsq-footer{position:static}.hsq-settings h2{font-size:18px}}
`
    async function request(cwd, body) {
      const response = await fetch('/api/hsq-develop/skills' + (cwd ? '?cwd=' + encodeURIComponent(cwd) : ''), { method: body ? 'POST' : 'GET', credentials: 'same-origin', headers: body ? { 'content-type': 'application/json' } : {}, ...(body ? { body: JSON.stringify(body) } : {}) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || String(response.status))
      return data
    }
    function createPage(ctx, t) {
      function Page() {
        React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
        const [data, setData] = React.useState(null)
        const [draft, setDraft] = React.useState([])
        const [cwd, setCwd] = React.useState(null)
        const [busy, setBusy] = React.useState(false)
        const [error, setError] = React.useState('')
        const [notice, setNotice] = React.useState('')
        const [picker, setPicker] = React.useState(false)
        const [query, setQuery] = React.useState('')
        const mounted = React.useRef(false)
        const sequence = React.useRef(0)
        const dirty = data && JSON.stringify(draft) !== JSON.stringify(data.selections)
        const catalog = new Map((data?.skills ?? []).map(s => [s.name, s]))
        const source = value => t(value?.startsWith('project') ? 'projectSource' : value?.startsWith('user') ? 'userSource' : 'runtimeSource')
        async function load(path, preserve = false) {
          const id = ++sequence.current
          setBusy(true); setError('')
          try {
            const next = await request(path)
            if (!mounted.current || sequence.current !== id) return
            if (preserve) setData(previous => ({ ...next, selections: previous.selections, revision: previous.revision }))
            else { setData(next); setDraft(next.selections) }
          } catch (e) { if (mounted.current && sequence.current === id) setError(e.message) }
          finally { if (mounted.current && sequence.current === id) setBusy(false) }
        }
        React.useEffect(() => { mounted.current = true; load(null); return () => { mounted.current = false; sequence.current++ } }, [])
        React.useEffect(() => {
          if (!dirty) return
          const prevent = e => { e.preventDefault(); e.returnValue = '' }
          window.addEventListener('beforeunload', prevent)
          return () => window.removeEventListener('beforeunload', prevent)
        }, [dirty])
        async function save() {
          setBusy(true); setError(''); setNotice('')
          try {
            const saved = await request(null, { selections: draft, revision: data.revision })
            if (!mounted.current) return
            setData(current => ({ ...current, selections: saved.selections, revision: saved.revision }))
            setDraft(saved.selections); setNotice(t('saved')); setPicker(false)
          } catch (e) { if (mounted.current) setError(e.message) }
          finally { if (mounted.current) setBusy(false) }
        }
        async function chooseDirectory() {
          try { const path = await ctx.uiWorkspace.pickDirectory(); if (path && mounted.current) { setCwd(path); load(path, true) } }
          catch (e) { setError(e.message) }
        }
        const selected = new Set(draft.map(s => s.name))
        const matches = (data?.skills ?? []).filter(s => (s.name + '\n' + s.description).toLocaleLowerCase().includes(query.toLocaleLowerCase()))
        function toggleAddition(name) {
          setNotice('')
          setDraft(rows => rows.some(s => s.name === name) ? rows.filter(s => s.name !== name) : [...rows, { name, enabled: true }])
        }
        const button = (label, action, options = {}) => h('button', { type: 'button', className: 'hsq-button', disabled: busy, onClick: action, ...options }, label)
        return h('section', { className: 'hsq-settings', 'aria-label': t('title'), 'aria-busy': busy },
          h('style', null, CSS),
          h('h2', null, t('title')), h('p', { className: 'hsq-muted' }, t('subtitle')),
          h('div', { className: 'hsq-directory' }, h('span', { className: 'hsq-muted hsq-path' }, cwd || t('userOnly')), button(t('project'), chooseDirectory, { className: 'hsq-button hsq-small' }), cwd && button(t('useUser'), () => { setCwd(null); load(null, true) }, { className: 'hsq-button hsq-small' }), button(t('reload'), () => load(cwd, !!data), { className: 'hsq-button hsq-small' })),
          error && h('p', { className: 'hsq-error', role: 'alert' }, error, ' ', button(t('retry'), () => load(cwd))),
          notice && h('p', { className: 'hsq-success', role: 'status' }, notice),
          data?.complete === false && h('p', { className: 'hsq-warn', role: 'status' }, t('incomplete')),
          !data ? h('p', null, t('loading')) : h(React.Fragment, null,
            h('div', { className: 'hsq-toolbar' }, h('h3', null, t('external'), ' ', h('span', { className: 'hsq-badge' }, draft.length)), button(t('add'), () => { setPicker(!picker); setQuery('') }, { className: 'hsq-button hsq-primary', 'aria-expanded': picker })),
            picker && h('div', { className: 'hsq-picker' },
              h('input', { className: 'hsq-input', type: 'search', value: query, onChange: e => setQuery(e.target.value), placeholder: t('search'), 'aria-label': t('search'), autoFocus: true }),
              h('div', { className: 'hsq-results' }, matches.length ? matches.map(s => h('label', { className: 'hsq-option', key: s.name }, h('input', { type: 'checkbox', checked: selected.has(s.name), disabled: busy, onChange: () => toggleAddition(s.name) }), h('div', { className: 'hsq-info' }, h('span', { className: 'hsq-name' }, s.name), ' ', h('span', { className: 'hsq-badge' }, source(s.source)), h('div', { className: 'hsq-description' }, s.description)))) : h('p', { className: 'hsq-muted' }, t('noResults'))),
              h('div', { className: 'hsq-picker-end' }, button(t('done'), () => setPicker(false)))),
            draft.length === 0 && h('div', { className: 'hsq-empty' }, t('empty')),
            draft.map(s => {
              const detail = catalog.get(s.name)
              const missing = !detail && data.complete !== false
              return h('div', { className: 'hsq-row', key: s.name },
                h('div', { className: 'hsq-info' }, h('span', { className: 'hsq-name' }, s.name), detail && h('span', null, ' ', h('span', { className: 'hsq-badge' }, source(detail.source))),
                  detail ? h('details', null, h('summary', { className: 'hsq-muted' }, t('details')), h('div', { className: 'hsq-description' }, detail.description)) : h('div', { className: 'hsq-description' }, t('missingHint'))),
                h('div', { className: 'hsq-actions' }, h('span', { className: 'hsq-status ' + (missing ? 'hsq-warn' : s.enabled ? 'hsq-success' : 'hsq-muted') }, t(missing ? 'missing' : s.enabled ? 'enabled' : 'disabled')),
                  h('button', { type: 'button', className: 'hsq-switch', role: 'switch', 'aria-checked': s.enabled, 'aria-label': t('toggle') + ': ' + s.name, disabled: busy, onClick: () => { setNotice(''); setDraft(rows => rows.map(row => row.name === s.name ? { ...row, enabled: !row.enabled } : row)) } }, h('span')),
                  button(t('remove'), () => { setNotice(''); setDraft(rows => rows.filter(row => row.name !== s.name)) }, { className: 'hsq-button hsq-small', 'aria-label': t('remove') + ': ' + s.name })))
            }),
            h('p', { className: 'hsq-muted' }, t('scope')),
            h('details', { className: 'hsq-core' }, h('summary', null, t('core'), ' · ', data.coreSkills.length), h('p', { className: 'hsq-muted' }, t('protected')), h('div', { className: 'hsq-core-list' }, data.coreSkills.map(name => h('span', { className: 'hsq-badge', key: name }, name)))),
            h('div', { className: 'hsq-footer' }, h('span', { className: 'hsq-status hsq-muted', role: 'status' }, t(dirty ? 'unsaved' : 'applying')), button(t('cancel'), () => { setDraft(data.selections); setNotice(''); setPicker(false) }, { disabled: busy || !dirty }), button(t(busy ? 'saving' : 'save'), save, { className: 'hsq-button hsq-primary', disabled: busy || !dirty }))))
      }
      return Page
    }
    return {
      inject: ['slots', 'locale', 'uiWorkspace'],
      apply(ctx) {
        for (const [language, dictionary] of Object.entries(dictionaries)) ctx.effect(() => ctx.locale.register(NS, language, dictionary))
        const t = ctx.locale.bind(NS)
        const Page = createPage(ctx, t)
        ctx.slots.inject('settings.section', () => ctx.slots.register({ name: 'settings.section', id: 'hsq-develop', order: 25, label: () => t('title') }, Page))
      },
    }
  },
})
