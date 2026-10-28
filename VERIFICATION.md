# 验证记录

## 0.3.0 外部技能设置（2026-10-28）

- 新增原生 Settings → HSQ 开发，提供名称/说明搜索、多项添加、启停、移除、目录选择、内置工作流只读清单、保存/取消及中英文本。
- 16 项 Node 测试通过，覆盖原技能策略、四项默认选择迁移、空选择、停用/移除区别、内置保护、非法输入、并发冲突、私有目录读取与 lease 清理、声明生命周期、HTTP 认证/身份/JSON/大小检查。
- 使用已安装 Harness 的 Electron Node 模式运行 test/runtime-integration.mjs，以真实 Cordis Context、Loader、skills、agentPresets 和 scope 完成挂载与保存重载验证；没有启动服务器、模型会话或写入真实 profile。外部 provider 使用两项固定测试技能；发现目录可见未选技能，模型目录只见已启用项；清空后新作用域仅保留8内置项，旧作用域仍能加载原已选技能；全局目录没有泄漏，路由重载没有重复注册。
- 该集成检查发现并修正了依赖重载时序：profile reconcile 返回后，预设 owner 仍可能在挂载。保存接口等待新 owner 就绪，并继续检查原生预设诊断后才返回成功。
- 页面只使用主题 token、原生 settings.section 与 Host 目录选择器。Client JavaScript 语法及 bundle 导出已检查；尚未完成当前 GUI 的实际渲染、明暗主题和点击往返验证。
- 本地链接安装成功，但安装器返回 application=restart-required、restartReason=unmanaged-plugin。当前进程的旧插件仍在运行；必须重启 DSH 后检查新服务、真实 slot 和页面行为。不能将上述隔离集成测试当成当前 GUI 已生效的证据。

## 0.2.2 根因诊断深度（2026-10-27）

- 常驻规则区分最小改动与调查深度，诊断在可执行且影响结论的证据检查未完成时继续推进。
- diagnose 加入现场锚定、上游状态/调用路径、竞争解释、反证实验、外部机制研究和明确完成门槛；区分根因已确认、机制支持但现场待证、尚未确定。保留只读、Spec 冲突、SQL/Git 及高风险授权规则。
- 8 项 Node 测试通过，包括技能资源低于工具修剪阈值；可执行合成故障核验通过。
- 两个独立子 Agent 用旧版/新版实际调查同一故障样例，均完成6/6验收点，未修改fixture；这是平局，不证明新版行为更稳定。样例未复现真实浅调查，限制及结果见 evals/RESULTS.md。
- 独立审查未发现实施阻塞；补回证据脱敏及不回显秘密的要求。静态评审页与原始报告仅保存在本地评估工作区。
- 安装返回 application=applied、warnings=[]；真实预设 roster 无 broken，所有启用行 active，systemPrompt.assemble 可见新持续诊断规则（常驻2135字符），诊断资源约2.5k字符，低于8192修剪阈值。三项外部技能白名单保留；临时验证bundle已移除。

## 0.2.1 兼容声明修复（2026-10-26）

- engines.dsh 从精确 0.2.1-rc.2 改为 >=0.2.1-rc.2 <0.2.2-0，允许同系列后续 RC 和正式版，保留下一补丁系列边界。
- 在 DSH 0.2.1-rc.3 上重新安装返回 application=applied、warnings=[]；Inspect 可见预设声明。8 项 Node 回归测试通过。这些证据不代表未来版本或所有实际业务行为均已测试。
- 保留 ui-ux-pro-max、archify、ego-browser 的额外技能白名单。
- 下述 JSON 快照为开发机器上的历史记录，已被 .gitignore 排除，不随 GitHub 源码上传。

## 0.2.0 技能白名单升级

- 8 项 Node 测试全部通过：原4项资源/生命周期检查，加默认8项、精确额外白名单、显式allow-all、非法名称及取消行为检查。
- 独立 registry realm、provider 和 tool-skill 同组；运行时实现使用 Host 实际 Service 类，避免本地 bundle 复制/安装第二份 Harness 依赖。
- 最终真实 registry 验证在组合挂载稳定后执行：目录恰好8个工作流；ego-browser、旧hsq-develop直接加载被拒；hsq-dev-review可加载；临时添加ego-browser后目录9项且可加载，其他外部技能仍不可加载；恢复后8项。临时变更只针对验证用预设修订，随后完整移除验证/观察bundle。
- 安装返回 application=applied、warnings=[]，版本0.2.0。默认预设仍standard。验证快照见 skill-policy-verification.json。
- 初次扩展使用裸模块import未能从工作区解析Host依赖，已改为使用Host registry类；另一次验证在挂载完成前读取无scope目录，后改为挂载完成后使用真实preset lease。历史失败诊断文件是开发过程记录，不是最终运行依赖或当前成功证据。
- 目录和get使用同一过滤策略，tool-skill手势复用get；未执行浏览器GUI多选或真实 /技能名 对话往返，尚无独立勾选面板。白名单是技能可见/可加载策略，不是Shell/read安全沙箱。

以下为0.1.0历史基线；关于旧技能仍可见的限制已由0.2.0白名单取代，其他验证限制仍适用。

日期：2026-10-23；版本：0.1.0；运行时：Harness 0.2.1-rc.2。

## 已实际完成

- Node JavaScript 语法检查通过。
- 4 项 Node 测试通过：8 个资源/正文有效且低于工具修剪阈值、注册/卸载、注册失败回滚、发布资源/元数据/无安装脚本。
- 独立审查逐份比对旧 hsq-develop 主文档及 7 references、新 bundle 和8技能，未报告具体阻塞缺陷。
- 插件管理器安装返回 application=applied，warnings=[]，包安装 exitCode=0。
- 临时只读 Host 验证器用真实 agentPresets.acquireScope 加载新预设；所有启用行 active，broken 未设置，无 leakedServices。
- 8 个 skill 通过真实 skills.get 读取，正文和目录资源有效；全局及 standard 作用域均不可见。
- 真实 systemPrompt.assemble 读到 HSQ persona 及全部路由：常驻核心 1889 字符，8 正文合计 7790 字符，每次按需加载。
- 默认 resolve() 仍为 standard，hsq-develop 的 isDefault=false。
- 已验证双语元数据存在、原创 SVG 的 XML/viewBox 有效且 381 bytes；实际 GUI 图标渲染未检查。
- 验证器临时 bundle 已从 profile 移除；没有删除旧技能或切换用户会话。完整运行时快照保留于 runtime-verification.json，不作为发布运行依赖。

## 纠正的验证假设

第一次验证误以为 spawn subagent 应立即出现在站立 preset scope，断言失败。检查当前安装源码发现 modelSelectionSettings=true 的 spawn 工具在真实 Agent 创建后按会话注册；改为验证该插件配置存在且 active，fork 工具可见。新预设在站立作用域的其余检查全部通过。尚未在使用新预设的真实会话调用 spawn，因此不把这个调用列为已验证。

## 规则决策烟测

独立审查 Agent 在已读候选 persona/工作流后，对 test/scenarios.json 的12个输入逐项产出下一步动作、加载入口、是否等待及禁止动作，再对照 must/mustNot。本次12/12符合：只读诊断、Spec冲突全停、窗口函数授权、只批索引不加字段、普通自主推进、显式一步、退出优先、证据复用、保护他人暂存提交、浏览器选择、相邻问题范围、交付顺序。未执行被测副作用，只证明本次规则决策可符合；不代表真实工具轨迹、自动触发或多次模型稳定性测试通过。

## 验证限制

- 没有真实业务仓库、数据库/生产迁移、Git 提交/推送或浏览器交互的集成测试；test/scenarios.json 是输入与预期，不是通过记录。
- 规则是模型指令，不是工具安全拦截器；模型和上下文会影响遵循情况。
- 旧技能仍保留在用户目录，可被 filesystem 发现；新 persona 指示不重复加载。用户显式调用旧技能仍可能注入其内容。
- 安装为本地链接；请保留此源码目录。发布 files 覆盖已检查，未执行 npm pack；本次不分发压缩包。
