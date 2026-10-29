# 规则迁移与取舍

旧 hsq-develop 主文档及全部 7 份 references 在实现前逐份核对。下表是迁移覆盖索引，运行时仅依赖本包资源。此包不会自动删除原技能。

| 原规则 | 新位置 |
| --- | --- |
| 第一性原理、事实/约束/不变量/假设、最小模型、状态归属 | 常驻核心、design、diagnose、implement |
| 仓库约定、Git 三类改动、环境/配置/依赖/验收、证据搜索 | 常驻核心；专项 implement、git |
| 启动/加载/交付检查去重与失效后补查 | 常驻核心、implement、deliver |
| 只读请求、实现持续推进、明确 Git 授权、保护改动 | 常驻核心、git、review、diagnose |
| Spec 关键前提冲突停止全部实施，用户决定 | 常驻核心、design、diagnose、step |
| 破坏性/生产/凭据权限/复杂语义/兼容高风险确认 | 常驻核心；database、git |
| 诊断预期/实际、首个违规点、因果链、根因/放大因素 | diagnose |
| 异步、UI 未显示 vs 数据丢失、重复工作 vs 慢接口 | diagnose、implement |
| 性能基线、真实规模、隔离实验、同条件对比 | diagnose、database、deliver |
| 功能设计、Spec 核验、影响接口/tool/租户/环境 | design、implement、deliver |
| 旧数据/配置/默认值、创建更新、可选必填 | implement、database、deliver |
| 最低稳定责任边界、禁止延时/无界重试掩盖问题 | diagnose、implement |
| 保留元数据、模型结果与诊断分层、避免二次序列化 | implement |
| 终态、取消拒绝超时、重连重复乱序、持久化/UI | diagnose、implement |
| 同根因相邻轻量搜索，专项/额外修复先确认 | implement、deliver |
| 浏览器验证改为仅用户主动明确要求；不主动询问或建议，已明确免重复问，报告实际证据 | 常驻核心、implement、deliver |
| 窗口函数、唯一索引、新字段分别授权 | 常驻核心、database |
| SQL 正确性、真实规模、执行计划；API N+1/串行链/批量/失败一致性 | database |
| 显式关键词、持续模式、退出优先、每次一步、计划变化确认 | 常驻核心、step |
| blocked、一个 in_progress、Spec 阻塞、最后组合回归 | step；blocked 不硬塞给不支持的 Todo schema |
| HEAD 对工作区三类变更；严重度/文件行号/行为测试/干净构建/只读 | review |
| Git 差异/秘密/diff-check、仓库风格优先、中文前缀、只暂存相关、不擅自 amend | git |
| 交付按影响→逻辑→验证风险，行为优先、真实结果、不过度细节 | deliver |
| 其他专业技能协作与渐进加载 | 常驻工作流路由 |
| 契约文档/Wiki 是否更新 | implement、deliver |

## 对话偏好融合（2026-10-29）

保留现有工程规则，将四个独立 vibe 技能的增量放回对应职责，避免两套流程同时运行：

| 来源 | 融入位置与增量 |
| --- | --- |
| vibe-engineering | design：生命周期、缓存失效、异步责任、失败成本与适度恢复；implement：开发阶段与已有部署的兼容边界、替换后的旧逻辑清理 |
| vibe-product-ui | 新增 product-ui：业务语言、操作反馈、真实内容布局、按阶段使用局部原型；从常驻路由、design、implement 进入 |
| vibe-debug-consistency | diagnose：权威状态、实时/历史路径、避免依赖模型自然语言维护可靠状态；implement：关联入口与状态验收映射 |
| vibe-change-delivery | implement：尊重本次验证限制；git：按用户要求确认冲突并保留双方有效行为；deliver：配置覆盖、生效方式、重建/重启/迁移和发版文档 |

注册表与内置允许列表增加 product-ui，清空外部技能仍保留九个内置工作流。未迁移为新的外部技能依赖；旧的四技能文件和用户选择不由本插件删除。未改变浏览器主动请求门槛、SQL 特定操作授权、Spec 实质冲突停止规则、Git 授权、主 Agent 默认执行或显式逐步模式。

原型文件仅在用户要求产物或已有实现范围允许时生成，实际 Harness 计划模式仍只读；不把“做原型”解释成浏览器测试许可。新增用例收录于 test/scenarios.json，场景清单本身不是行为评估通过记录。

## 上游适配

Superpowers：吸收需求调查、可验证计划、系统调试、RED-GREEN、独立需求/质量审查、反馈核实、隔离上下文与恢复记录；不复制无条件 TDD 删除重写、每步自动提交、反复设计审批、每条成功声明重跑全套。其执行中自行裁决 Spec 冲突的规则由 HSQ 的关键冲突等待决定取代。默认主 Agent 自行完成；仅用户明确要求或确有必要时委派子 Agent，复杂度和并行收益本身不足以触发，保留相关仓库测试要求。

Ponytail：吸收必要性/复用梯度、调用方完整性、正确/安全/负载/测试/性能/精简顺序、具体可证实发现、shortcut 限制及升级触发。审查采用 HSQ 默认工作区基线、问题优先输出，不无改动回退最后提交。不引入上游 hooks、遥测、band、成本面板或常驻 level 状态。

旧技能名字与 preset id 相同但分属不同注册表。自带技能使用 hsq-dev-* 命名，不在用户技能目录创建同名遮盖；普通/其他预设不会看见当前这 9 个 scoped 技能。新预设不自动移除用户/项目的其他规则。自 0.2.0 起增加独立 skills 注册表 realm，所有 provider/consumer 在同组；additionalSkills 控制外部技能，0.2.0 初始默认为空列表；当前默认选择和管理方式见 README，旧技能不会自动通过该预设的目录/加载入口暴露。仅控制技能，不删文件也不代替工具权限。
