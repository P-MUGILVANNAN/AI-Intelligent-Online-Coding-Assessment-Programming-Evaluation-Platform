# CodeEval AI – Database Schema & Entity Relationship Model

The platform uses **PostgreSQL** in production with **SQLAlchemy 2.0 ORM** (and SQLite support for instant zero-dependency local development).

```
                    ┌─────────────────┐
                    │  Institutions   │
                    └────────┬────────┘
                             │ 1:N
                    ┌────────▼────────┐
                    │      Users      ├──────────┐
                    └────────┬────────┘          │
                             │ 1:N               │ 1:N
            ┌────────────────┼────────────────┐  │
            ▼                ▼                ▼  ▼
     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
     │ Assessments │  │  Questions  │  │ Submissions │
     └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
            │                │                │
            │ N:M            │ 1:N            ├────────────────┐
            ▼                ▼                ▼                ▼
     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
     │ Assessment- │  │ Question-   │  │ Submission- │  │ CodeQuality-│
     │  Questions  │  │  TestCases  │  │ TestResults │  │   Reports   │
     └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

---

## 1. Table Definitions

### `users`
- `id`: `String(36)` / `UUID` Primary Key
- `full_name`: `String(150)` NOT NULL
- `email`: `String(255)` UNIQUE NOT NULL (Index)
- `password_hash`: `String(255)` NOT NULL (Argon2 / Bcrypt)
- `role_id`: `String(36)` Foreign Key -> `roles.id`
- `institution_id`: `String(36)` Foreign Key -> `institutions.id` (Nullable)
- `is_active`: `Boolean` DEFAULT True
- `bio`: `Text` Nullable
- `created_at`: `DateTime`
- `updated_at`: `DateTime`

### `assessments`
- `id`: `String(36)` Primary Key
- `title`: `String(255)` NOT NULL
- `description`: `Text`
- `instructions`: `Text`
- `category`: `String(100)`
- `difficulty`: `String(20)` (Easy, Medium, Hard)
- `duration`: `Integer` (Duration in minutes)
- `total_marks`: `Integer`
- `number_of_questions`: `Integer`
- `allowed_languages`: `JSON`
- `visibility`: `String(20)` (Public, Private, Restricted)
- `status`: `String(20)` (Draft, Scheduled, Active, Completed, Archived)
- `created_by`: `String(36)` Foreign Key -> `users.id`
- `created_at`: `DateTime`

### `questions`
- `id`: `String(36)` Primary Key
- `title`: `String(255)` NOT NULL
- `description`: `Text` NOT NULL
- `difficulty`: `String(20)`
- `topic`: `String(50)`
- `max_marks`: `Integer`
- `expected_time_complexity`: `String(50)`
- `expected_space_complexity`: `String(50)`
- `input_format`: `Text`
- `output_format`: `Text`
- `constraints`: `Text`
- `sample_input`: `Text`
- `sample_output`: `Text`
- `explanation`: `Text`
- `starter_code`: `JSON`
- `created_by`: `String(36)` Foreign Key -> `users.id`

### `question_test_cases`
- `id`: `String(36)` Primary Key
- `question_id`: `String(36)` Foreign Key -> `questions.id`
- `input_data`: `Text` NOT NULL
- `expected_output`: `Text` NOT NULL
- `marks`: `Integer`
- `is_hidden`: `Boolean` (True for evaluation cases hidden from student API responses)
- `time_limit`: `Float` (Seconds)
- `memory_limit`: `Integer` (MB)
- `order_index`: `Integer`

### `submissions`
- `id`: `String(36)` Primary Key
- `student_id`: `String(36)` Foreign Key -> `users.id`
- `assessment_id`: `String(36)` Foreign Key -> `assessments.id`
- `question_id`: `String(36)` Foreign Key -> `questions.id`
- `source_code`: `Text` NOT NULL
- `programming_language`: `String(30)` NOT NULL
- `verdict`: `String(50)` (Accepted, Wrong Answer, Compilation Error, Runtime Error, Time Limit Exceeded)
- `score`: `Float`
- `passed_test_cases`: `Integer`
- `total_test_cases`: `Integer`
- `execution_time`: `Float` (Seconds)
- `memory_usage`: `Float` (MB)
- `compiler_output`: `Text`
- `submitted_at`: `DateTime`

### `code_quality_reports`
- `id`: `String(36)` Primary Key
- `submission_id`: `String(36)` Foreign Key -> `submissions.id` UNIQUE
- `quality_score`: `Float` (0-100)
- `cyclomatic_complexity`: `Integer`
- `maintainability_index`: `Float`
- `readability_score`: `Float`
- `detected_issues`: `JSON`
- `improvement_suggestions`: `JSON`
- `explanation`: `Text`
- `estimated_time_complexity`: `String(50)`
- `estimated_space_complexity`: `String(50)`

### `plagiarism_reports`
- `id`: `String(36)` Primary Key
- `assessment_id`: `String(36)` Foreign Key -> `assessments.id`
- `question_id`: `String(36)` Foreign Key -> `questions.id`
- `submission_a_id`: `String(36)` Foreign Key -> `submissions.id`
- `submission_b_id`: `String(36)` Foreign Key -> `submissions.id`
- `similarity_score`: `Float` (Composite %)
- `token_similarity`: `Float`
- `tfidf_similarity`: `Float`
- `ast_similarity`: `Float`
- `matching_sections`: `JSON`
- `detection_method`: `String(100)`

### `plagiarism_reviews`
- `id`: `String(36)` Primary Key
- `plagiarism_report_id`: `String(36)` Foreign Key -> `plagiarism_reports.id`
- `reviewed_by`: `String(36)` Foreign Key -> `users.id`
- `review_status`: `String(50)` (Pending Review, Under Investigation, Confirmed Violation, Not Plagiarism)
- `reviewer_notes`: `Text`
- `reviewed_at`: `DateTime`
