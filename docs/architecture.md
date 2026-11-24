# CodeEval AI – System Architecture & Engineering Specifications

## 1. Executive Architecture Summary
**CodeEval AI** is an enterprise-grade, IEEE research-oriented online coding assessment and programming evaluation platform designed for academic institutions, universities, coding academies, and corporate recruiters. 

The platform decouples code compilation, execution, correctness scoring, code quality static analysis, and plagiarism auditing into specialized, loosely coupled services communicating via standardized REST APIs and asynchronous message schemas.

```
                          ┌────────────────────────┐
                          │   React 18 + Vite UI   │
                          │ Monaco Editor + Recharts│
                          └───────────┬────────────┘
                                      │ HTTP / REST
                                      ▼
                          ┌────────────────────────┐
                          │   FastAPI Web Engine   │
                          │  (Auth, RBAC, Routing) │
                          └─────┬────────────┬─────┘
                                │            │
            ┌───────────────────┘            └────────────────────┐
            ▼                                                     ▼
┌───────────────────────┐                             ┌───────────────────────┐
│   PostgreSQL / SQLite │                             │ Subprocess Sandbox    │
│    SQLAlchemy 2.0     │                             │ (Local / Judge0 API)  │
│ Models & Migrations   │                             │ Ephemeral Cgroups/Env │
└───────────────────────┘                             └───────────┬───────────┘
            │                                                     │
            ▼                                                     ▼
┌───────────────────────┐                             ┌───────────────────────┐
│   Hybrid Plagiarism   │                             │ Static AST Analyzer   │
│  AST + TF-IDF + Token │                             │ Cyclomatic Complexity │
│  Similarity Invariant │                             │ Big-O Time Estimate   │
└───────────────────────┘                             └───────────────────────┘
```

---

## 2. Component Decoupling & Modules

### 2.1 Frontend Architecture (React + Vite + TypeScript)
- **State Management & Context**: `AuthContext` provides declarative authentication state, role claims, token refresh mechanisms, and reactive UI updates.
- **Online Coding Environment**: Integrates Microsoft's Monaco Editor (`@monaco-editor/react`) with syntax highlighting, auto-indentation, starter code loading, and font scaling.
- **Analytics Visualization**: Recharts provides SVG-rendered line charts, bar graphs, and pie distributions for topic mastery, progress timelines, and language utilization.

### 2.2 Backend Architecture (FastAPI + Pydantic + SQLAlchemy)
- **Role-Based Access Control (RBAC)**: Token payload authorization enforces strict access levels:
  - `Administrator`: Institutional settings, system configs, audit logs, and global user management.
  - `Instructor`: Assessment configuration, question banking, hidden test cases, live monitoring, and plagiarism determination.
  - `Student`: Examination taking, Monaco IDE execution, public test case verification, and personal performance tracking.
- **Decoupled Evaluator**: Code correctness evaluation is isolated from AI code quality analysis. Students are not penalized in correctness marks for stylistic choices.

### 2.3 Sandboxed Execution Architecture
To prevent remote code execution (RCE), fork bombs, and infrastructure compromise:
1. **Isolated Ephemeral Environments**: Every execution runs in a distinct temporary directory cleaned up immediately upon process exit.
2. **Network Egress Block**: Network sockets and loopback connections are disabled.
3. **AST Static Whitelisting / Blocklisting**: For Python, an AST visitor screens for unauthorized modules (`socket`, `subprocess`, `ctypes`, `winreg`, `shutil`).
4. **Hard Limits**: Process timeouts (default 2.0s) and memory caps (128MB) monitored via `psutil`.

---

## 3. Execution Pipeline Workflow

1. **Client Submission**: Candidate sends source code, programming language, question ID, and assessment ID to `POST /api/code/submit`.
2. **Verification & Session Check**: Server validates JWT claims, active examination status, and remaining time duration.
3. **Sandbox Dispatch**: The local isolated sandbox creates a sandboxed directory, writes the code, and compiles/runs it against authorized test cases.
4. **Authoritative Evaluation**: Output is normalized (whitespace and numeric tolerance) and compared against expected test outputs.
5. **AI Quality Engine**: Code is passed to the AST visitor for cyclomatic complexity and maintainability indexing.
6. **Persistence & Response**: Results, execution stats, marks, and AI suggestions are saved to the database and returned to the client. Hidden test cases remain masked in student-facing responses.
