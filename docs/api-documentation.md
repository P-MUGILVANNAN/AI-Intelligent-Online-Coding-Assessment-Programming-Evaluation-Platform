# CodeEval AI – REST API Documentation

Base URL: `/api`

All protected endpoints require an `Authorization: Bearer <access_token>` HTTP header.

---

## 1. Authentication Endpoints

### `POST /auth/register`
Creates a new user account.
- **Request Body**:
  ```json
  {
    "full_name": "Alan Turing",
    "email": "alan@turing.edu",
    "password": "SecurePassword123",
    "role": "Instructor",
    "institution_id": "optional-uuid"
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "access_token": "jwt-token-string",
    "refresh_token": "refresh-token-string",
    "token_type": "bearer",
    "user": { "id": "uuid", "full_name": "Alan Turing", "email": "alan@turing.edu", "role": "Instructor" }
  }
  ```

### `POST /auth/login`
Authenticates a user and generates JWT access and refresh tokens.
- **Request Body**: `{"email": "student@codeeval.ai", "password": "Student@123"}`
- **Response** `200 OK`: JWT token payload and user role metadata.

### `POST /auth/refresh`
Rotates an expired access token using a valid refresh token.
- **Request Body**: `{"refresh_token": "valid-refresh-token"}`

### `GET /auth/me`
Returns the currently authenticated user's profile and institutional affiliations.

---

## 2. Assessment Management Endpoints

### `GET /assessments`
Retrieves assessments.
- **Query Parameters**: `status`, `category`, `difficulty`, `search`, `limit`, `offset`.
- **Access**: Students see public/scheduled assessments; Instructors & Admins see all.

### `GET /assessments/{id}`
Returns assessment details and linked questions.
- **Security Rule**: For candidates, hidden test-case input and expected output payloads are sanitized to `[Hidden Test Case]`.

### `POST /assessments`
Creates a new assessment.
- **Access**: `Instructor`, `Administrator`.

### `POST /assessments/{id}/start`
Initiates or resumes a student's examination session. Returns remaining server-authoritative seconds.

### `POST /assessments/{id}/finish`
Finalizes an examination session.

### `POST /assessments/{id}/violation`
Logs a focus or window loss violation for an assessment session.

---

## 3. Programming Questions Endpoints

### `GET /questions`
Retrieves questions with filtering by `topic`, `difficulty`, `search`.

### `GET /questions/{id}`
Returns question specifications, constraints, starter templates, and test cases.

### `POST /questions`
Creates a new programming problem with starter code and test cases.
- **Access**: `Instructor`, `Administrator`.

---

## 4. Code Execution & Submissions Endpoints

### `POST /code/run`
Runs code against sample/public test cases or custom input. Does not save permanent submission score.
- **Request Body**:
  ```json
  {
    "source_code": "print(1 + 1)",
    "programming_language": "python",
    "question_id": "question-uuid",
    "custom_input": "optional-stdin"
  }
  ```

### `POST /code/submit`
Authoritative submission evaluation. Executes against all authorized test cases (visible and hidden), calculates score, runs AST AI code quality analysis, and updates student performance records.
- **Supported Verdicts**: `Accepted`, `Wrong Answer`, `Compilation Error`, `Runtime Error`, `Time Limit Exceeded`, `Memory Limit Exceeded`.

### `GET /submissions/{id}`
Returns submission details, test-case pass rates, execution runtime, and AI Code Quality Report.

---

## 5. AI Plagiarism & Similarity Endpoints

### `POST /plagiarism/analyze`
Triggers cross-submission similarity detection across a question or assessment.
- **Request Body**: `{"assessment_id": "uuid", "similarity_threshold": 60.0}`

### `GET /plagiarism/reports`
Lists flagged submission pairs exceeding similarity threshold.

### `GET /plagiarism/reports/{id}`
Returns side-by-side code diff and similarity breakdown (Token %, TF-IDF %, AST %).

### `PUT /plagiarism/reports/{id}/review`
Records instructor audit decision (`Pending Review`, `Under Investigation`, `Confirmed Violation`, `Not Plagiarism`) with audit notes.

---

## 6. Reports & Analytics Endpoints

### `GET /analytics/admin`: System-wide KPIs and Recharts visualization data.
### `GET /analytics/instructor`: Class performance, question difficulty, rankings.
### `GET /analytics/student`: Topic mastery, progress over time, acceptance rate.
### `GET /reports/export/{id}`: Downloads CSV report for assessment.
### `GET /reports/student/{id}/pdf`: Downloads candidate PDF performance evaluation scorecard.
