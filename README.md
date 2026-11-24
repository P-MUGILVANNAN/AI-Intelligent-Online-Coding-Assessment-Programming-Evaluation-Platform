# CodeEval AI – Intelligent Online Coding Assessment & Programming Evaluation Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%20%7C%20Python-3178C6.svg)](https://www.typescriptlang.org/)
[![Monaco Editor](https://img.shields.io/badge/Editor-Monaco%20IDE-blue.svg)](https://microsoft.github.io/monaco-editor/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An enterprise-grade, IEEE research-oriented online coding assessment and programming evaluation platform designed for academic institutions, universities, coding academies, and corporate recruiters. 

---

## 🚀 Key Features

- **Automated Compilation & Execution**: Multi-language support (Python 3, JavaScript/Node.js, C++, Java, and Go) in an isolated sandbox with CPU timeouts, memory ceilings, and process isolation.
- **Monaco Cloud IDE**: Browser-based three-panel coding environment with syntax highlighting, starter code loader, sample test execution, and full-screen proctoring mode.
- **Visible & Hidden Test Cases**: Decoupled public sample tests and server-authoritative hidden evaluation test cases.
- **AI-Based Code Quality & Static Analysis**: Independent evaluation of cyclomatic complexity, Halstead maintainability index, loop nesting levels, and asymptotic Big-O time complexity estimates.
- **Hybrid Plagiarism Detection**: Combines Lexical Token Jaccard similarity ($35\%$), TF-IDF cosine vectorization ($35\%$), and Abstract Syntax Tree (AST) node invariance ($30\%$) with starter code down-weighting.
- **Live Examination Proctoring**: Server-authoritative assessment timers, focus loss/window switch logging, and automated submission upon deadline.
- **Role-Based Portals**: Tailored interfaces for Administrators, Instructors/Evaluators, and Students/Candidates.
- **Interactive Analytics & Reporting**: Topic mastery charts, historical progress tracking, CSV grade-sheet exports, and downloadable student PDF evaluation scorecards.

---

## 🔑 Demo Accounts & Pre-Configured Credentials

The demo environment includes seeded accounts with distinct institutional permissions:

| Role | Email Address | Password | Permissions & Dashboard |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@codeeval.ai` | `Admin@123` | Institutional settings, user governance, global audit logs |
| **Instructor** | `instructor@codeeval.ai` | `Instructor@123` | Create exams, author questions, monitor live, plagiarism audit |
| **Student** | `student@codeeval.ai` | `Student@123` | Monaco coding workspace, take exams, review AI feedback |
| **Candidate 2** | `sarah.jenkins@codeeval.ai` | `Student@123` | Plagiarized submission pair example for demonstration |
| **Candidate 3** | `david.kim@codeeval.ai` | `Student@123` | Candidate with partial/wrong answers for demonstration |

*(All passwords can be modified in `database/seed/seed_data.py`.)*

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite 5, TypeScript, Tailwind CSS, Monaco Editor (`@monaco-editor/react`), Recharts, Lucide React, Axios, React Router v6.
- **Backend**: Python 3.14 / 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.0 ORM, PyJWT, Passlib (Bcrypt), ReportLab (PDF Engine).
- **Database**: PostgreSQL (Production) / SQLite (`codeeval.db` for instant local development).
- **Execution Sandbox**: Subprocess Container Isolation with monotonic timers, memory quota enforcement via `psutil`, and AST syscall filtering.
- **AI / Similarity**: Scikit-learn (TF-IDF Vectorizer & Cosine Similarity), Python `ast` syntax tree visitor, token normalization pipeline.

---

## ⚡ Quickstart Guide (Local Development)

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Seed database with 20 questions, 5 assessments, and demo users
python ../database/seed/seed_data.py

# Launch FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend API and Swagger UI will be live at `http://127.0.0.1:8000/docs`.*

### 2. Frontend Setup
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies (already installed if cloned)
npm install

# Start Vite development server
npm run dev
```
*Access the web application at `http://localhost:5173`.*

---

## 🐳 Docker Deployment

To launch the complete containerized stack (PostgreSQL, Redis, FastAPI, and Nginx-served React):
```bash
docker-compose up --build
```
- Web Application: `http://localhost`
- Backend API Docs: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`

---

## 🧪 Verification & Automated Testing

To run the verification suite testing security, sandbox execution, AI code quality analysis, and hybrid plagiarism detection:
```bash
python backend/tests/run_tests.py
```

---

## 📚 IEEE Research Documentation

Detailed empirical metrics, hybrid mathematical formulations, and experimental evaluations are available in:
- [System Architecture Specification](docs/architecture.md)
- [REST API Reference](docs/api-documentation.md)
- [Database Entity Schema](docs/database-schema.md)
- [IEEE Research Paper Specification](docs/ieee-research-paper.md)
