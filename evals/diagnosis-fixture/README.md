# Task view recovery service

Local read-only fixture; all execution uses in-memory objects. Modules use Node.js ESM without dependencies, files, network or database writes. No build step.

Reported incident: after opening workspace alpha and then beta in the same tab, refreshing the task view sometimes shows no tasks, although support can see beta tasks in storage. Operators suspect a stale view cache; restarting the tab temporarily helps. Diagnose the root cause and trigger conditions; do not edit the application.

Public check: `node --test recovery.test.mjs`. Investigate the actual code path from controller to client. `incident.log` is a synthetic excerpt from this incident; all clocks use the same timezone. The code and log represent the same deployed build.
