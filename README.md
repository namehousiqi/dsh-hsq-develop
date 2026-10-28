# HSQ Develop

面向 DeepSeek Harness 的编程开发预设。

从事实与约束出发，以最小完整改动解决问题，用可复核的证据完成交付。融合 [Superpowers](https://github.com/obra/superpowers) 的工程流程、[Ponytail](https://github.com/DietrichGebert/ponytail) 的精简原则与 HSQ 的开发偏好。

## 工作方式

- **追到机制，验证根因。** 沿调用链和状态来源持续取证，用复现、对照与反证区分假设和已确认原因；只读诊断也完成必要调查。
- **默认主 Agent 完成。** 按需设计、拆分与核查；仅在用户明确要求或确有必要时委派子 Agent，不因任务复杂或可并行而自动启动。
- **验证真实行为。** 复用有效证据，为新增逻辑与缺陷补足相关验证，明确未验证范围。
- **授权边界清晰。** 分析与审查保持只读；提交、推送及特定数据库操作遵循明确授权。仅在要求“一步步做”时逐步确认。

## 安装

在 Harness 插件管理页添加来源：

```text
github:namehousiqi/dsh-hsq-develop
```

安装后，新建会话选择 **HSQ 开发**。私有仓库需要对应的 Git 访问权限；已安装同名版本时，先移除旧版本，再安装新来源。是否重启以插件管理器返回结果为准。

**DSH 兼容范围：** `>=0.2.1-rc.2 <0.2.2-0`。

## 内置工作流

常驻规则负责工程约束，工作流按任务加载。

| 工作流 | 职责 |
| --- | --- |
| `hsq-dev-design` | 需求澄清、设计、实施计划与任务委派 |
| `hsq-dev-diagnose` | 持续调查、竞争解释验证、根因确认与性能测量 |
| `hsq-dev-implement` | 最小完整实现、兼容性检查与行为验证 |
| `hsq-dev-database` | SQL、数据模型、索引与 API 查询策略 |
| `hsq-dev-review` | 变更审查、全仓审计与评审反馈 |
| `hsq-dev-git` | 提交、合并、分支与工作区管理 |
| `hsq-dev-step` | 显式逐步执行与阶段验收 |
| `hsq-dev-deliver` | 行为影响、核心机制与验证结果 |

## 技能白名单

每个预设使用独立技能目录。内置 8 项始终保留，外部技能按名称开放。

在 [cordis.patch.yml](cordis.patch.yml) 中修改 `hsq-skill-policy`：

```yaml
- id: hsq-skill-policy
  name: '@workspace/dsh-hsq-develop/skill-policy'
  config:
    additionalSkills:
      - ui-ux-pro-max
      - archify
      - ego-browser
      - choerodon-kanban
    allowAllSkills: false
```

以上为当前配置，外部技能需另行安装。`additionalSkills: []` 仅保留内置工作流；`allowAllSkills: true` 开放所有已发现技能。白名单同时控制目录与技能加载，不改变文件或工具权限。

重新应用配置后，在新会话中使用；已有会话保留原预设修订。

## 开发

无需构建，无第三方运行依赖。

```bash
node --check index.js
node --check skill-policy-runtime.js
node --test test/*.test.js
node evals/verify-fixture.mjs
```

诊断行为评估说明见 [evals/README.md](evals/README.md)。

推送源码后，通过 Harness 更新安装；运行中的预设不会随 Git 推送自动更新。

## 参考

[规则迁移](MIGRATION.md) · [验证记录](VERIFICATION.md) · [来源与许可](THIRD_PARTY_NOTICES.md)
