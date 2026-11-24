# CodeEval AI – Code Execution Engine Configuration

CodeEval AI supports two sandboxing execution architectures:

## 1. Native Isolated Subprocess Sandbox (Default)
Operates with zero external dependencies and runs directly out of the box on Windows and Linux hosts:
- **CPU Timeout Monitoring**: Subprocess timeout terminating rogue loops.
- **Process Memory Limits**: Peak working-set RSS memory tracked via `psutil`.
- **AST Security Whitelist/Blocklist**: Python AST syntax tree screened to prevent unauthorized imports (`socket`, `subprocess`, `ctypes`, `shutil`, `winreg`).
- **Temporary Ephemeral Isolation**: Each execution runs in a distinct temporary directory cleaned up immediately after exit.

## 2. Self-Hosted Judge0 Engine (Production Cluster)
For large-scale university testing, CodeEval AI integrates directly with Judge0 API deployments:
- Configure `.env` variables:
  ```env
  USE_JUDGE0=true
  JUDGE0_URL=http://localhost:2358
  JUDGE0_API_KEY=your_key_here
  ```
- Submissions are dispatched to Judge0's dockerized execution workers with configurable cgroup memory and CPU core pinning.
