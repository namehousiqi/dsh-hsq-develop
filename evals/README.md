# 根因诊断行为评估

这个本地 ESM fixture 构造了用户视角下“切换 workspace 后任务偶发消失”的跨租户事件游标问题，以及“同 workspace 再次刷新清空任务”的增量恢复问题。伪日志诱导先怀疑缓存；调查必须用代码路径和反证辨别。

`evals/evals.json` 定义同一个真实用户式诊断请求。冻结旧预设规则副本用于 baseline，candidate 使用当前 `hsq-dev-diagnose` 和 persona。二者对同一只读 fixture 独立调查，不允许修改样例。每次结果在独立评估工作区保存，不随安装包发布；检查引用到文件/行、实跑场景、实际实验结果、修复边界和确定程度。

## 核验

```bash
node verify-fixture.mjs
node --test diagnosis-fixture/recovery.test.mjs
```

公开的 2 项回归测试有意不覆盖跨租户复用或刷新；它们通过不能排除本故障。verify-fixture 脚本按预期确认跨租户空列表、存储数据仍在、清缓存无效、新连接暂时恢复、同租户后续刷新仍空。该脚本在内存中运行，不修改 fixture。

本次结果见 [RESULTS.md](RESULTS.md)。单场景、单次执行是定性 before/after 比较，不能代表多次模型稳定性或普遍基准。如果要扩成正式 benchmark，应加混合租户、序号重置、游标上次值、重复重放/乱序、无回归租户等场景，并多次运行评估方差。
