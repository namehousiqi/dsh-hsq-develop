# HSQ 开发预设

独立 Harness 预设 `hsq-develop`，显示名「HSQ 开发」。将 Superpowers 的工程闭环、Ponytail 的最小完整方案与 HSQ 的个人开发偏好融合；不依赖旧 hsq-develop 技能、研究仓库、本机绝对路径或上游插件安装。

## GitHub 托管与安装

源码仓库：https://github.com/namehousiqi/dsh-hsq-develop 。当前为私有仓库，克隆和安装需要有权访问此仓库的 GitHub 账号及 Git 凭据。

在 Harness 插件管理页中使用 GitHub 来源安装：

```text
github:namehousiqi/dsh-hsq-develop
```

本仓库根目录就是 bundle，无需构建。若已经安装同名本地版本，先通过 Harness 插件管理器移除，再安装 GitHub 来源；依据操作返回结果判断是否需要重启。私有仓库使用宿主机可用的 Git 认证，不要把 token 写进地址、源码或配置。若 GitHub 简写无法使用已有认证，可使用 SSH 地址 `git@github.com:namehousiqi/dsh-hsq-develop.git`。

也可先克隆到固定目录，再通过 Harness 以本地目录安装：

```bash
git clone git@github.com:namehousiqi/dsh-hsq-develop.git
cd dsh-hsq-develop
node --test test/*.test.js
```

维护时提交并推送源码；需要发布新版本时递增 package.json 的版本，并重新安装/更新 GitHub 来源。推送不会自动更新运行中的预设。运行时 JSON 诊断快照仅本地保存，不提交；验证过程及边界见 VERIFICATION.md。

## 使用

安装此 bundle 后，在 Harness 新建会话时选择「HSQ 开发」。现有会话保留原组合；此包不修改默认预设、不切换已有会话、不删除旧技能。普通开发任务自主完成实现和相关验证；“只分析/只诊断/只审查”保持只读；明确“一步步做”才逐步确认。

常驻规则位于 cordis.patch.yml 的 persona.prefix，8 个工作流在 skills/，由同包 index.js 注册到选择该预设的作用域。自 0.2.0 起，技能注册表、filesystem 和 tool-skill 位于同一个隔离组；内置这 8 个工作流，并按 additionalSkills 白名单开放外部技能。当前配置额外允许 ui-ux-pro-max、archify、ego-browser，需另行安装；未列入的用户/项目技能不进入该预设的目录或加载接口。验证替代后，用户可自行移除旧技能；本包没有任何指向旧目录的运行时引用。

| 工作流 | 触发 |
| --- | --- |
| hsq-dev-design | 关键设计歧义、跨模块、API/配置设计、多步骤计划/委派 |
| hsq-dev-diagnose | 根因、Bug、异常、失败、性能、缓存 |
| hsq-dev-implement | 实现、重构、修复、交互与自动化验证 |
| hsq-dev-database | SQL、数据库、索引、后端查询 |
| hsq-dev-review | 变更审查、全仓审计、评审反馈、shortcut 债务 |
| hsq-dev-git | 拉取、合并、提交、推送、分支和 worktree |
| hsq-dev-step | 显式逐步执行，持续至完成或明确退出 |
| hsq-dev-deliver | 功能/Bug 交付的影响、逻辑、验证与风险 |

保留文件/Shell/搜索、技能、计划模式、Todo、目标、后台任务、普通子 Agent、Web 与交付能力。不启用 workflow 批量编排和插件管理工具，也不新增浏览器/远程工具；已有 Host 能力依其作用域可用。完整访问权限不代表获得 SQL/Git/生产操作的业务授权。授权及只读规则是模型行为指令，不是拦截所有工具的强制安全机制；运行时沙箱和审批策略仍由 Harness 管理。

## 选择额外技能（0.2.0）

在 cordis.patch.yml 的 hsq-skills 组中修改 hsq-skill-policy 配置；也可以在 Harness 支持的预设 YAML 编辑入口保存等价配置。当前提供 YAML 配置，不含专门的多选勾选面板。

```yaml
- id: hsq-skill-policy
  name: '@workspace/dsh-hsq-develop/skill-policy'
  config:
    additionalSkills:
      - ui-ux-pro-max
      - archify
      - ego-browser
    allowAllSkills: false
```

- `additionalSkills: []`：仅内置 8 项。仓库当前配置额外允许上述 3 个技能；它们没有被打包进仓库，也不会自动安装。
- 列出精确技能名：额外开放已安装技能，不能用通配符；名称不存在不会自动安装。其 frontmatter 原有 model/user invocation 限制仍生效。
- `allowAllSkills: true`：恢复全部发现技能。
- 内置 8 项始终保留，不因空列表丢失。配置只作用于此预设，其他预设不变。
- 配置由预设修订持有，新建会话选择 HSQ 开发后生效；旧会话/已加载技能不会被追溯清除。编辑本地 bundle 后按插件管理器要求卸载并重新安装；若返回需重启，按 nextStep 操作。通过用户层预设配置保存的覆盖会优先于 bundle 文件，需要同步检查。

这会过滤目录、skill 加载及用户 `/技能名` 手势使用的注册表，不只是提示模型忽略。但不是文件系统访问控制：Shell/read 仍可在用户权限内读取磁盘，也不自动屏蔽该技能以外的 Host 工具；需要强权限隔离仍由沙箱/工具策略管理。

## 验证与维护

`node --check index.js` 与 `node --test test/*.test.js` 检查资源、注册回滚和卸载；test/scenarios.json 保存行为验收输入和预期，实际模型试验的结果另行记录，静态检查不能代替模型行为评估。运行时需要真实 Loader 挂载，核对 persona、工具、8 个技能及作用域隔离；不能只凭 YAML 解析宣称挂载成功。

该包不含构建步骤、安装脚本或第三方运行依赖。兼容范围为 `>=0.2.1-rc.2 <0.2.2-0`：允许同一 0.2.1 系列的后续 RC 和正式版，不自动放行 0.2.2 及更高系列。0.2.1-rc.2 和 rc.3 已完成相应验证；范围内的未来版本不是已测试承诺。升级跨出范围或接口变化时需核验并更新范围，不使用通配符或兼容豁免跳过检查。更新核心/技能后重新安装或按安装返回的 nextStep 操作，在新会话验证；已有会话不会自动迁移。通过插件管理器停用/移除此 bundle 可回退，原 preset 定义和旧技能保持原样。

资源发布包含补丁、index.js、8 个技能、双语元数据、原创图标、说明及来源许可。详细迁移覆盖见 MIGRATION.md，上游版本和 MIT 声明见 THIRD_PARTY_NOTICES.md。
