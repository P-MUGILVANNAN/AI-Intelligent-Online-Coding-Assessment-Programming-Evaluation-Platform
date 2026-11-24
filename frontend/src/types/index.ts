export interface User {
  id: string;
  full_name: string;
  email: string;
  role?: { id: string; name: string };
  institution?: { id: string; name: string; code: string };
  is_active: boolean;
  bio?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface TestCase {
  id: string;
  question_id: string;
  input_data?: string;
  expected_output?: string;
  marks: number;
  is_hidden: boolean;
  time_limit: number;
  memory_limit: number;
  order_index: number;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  max_marks: number;
  expected_time_complexity: string;
  expected_space_complexity: string;
  input_format: string;
  output_format: string;
  constraints: string;
  sample_input: string;
  sample_output: string;
  explanation?: string;
  starter_code?: Record<string, string>;
  supported_languages?: string[];
  created_by?: string;
  created_at: string;
  test_cases: TestCase[];
}

export interface Assessment {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  category: string;
  difficulty: string;
  start_time?: string;
  end_time?: string;
  duration: number; // minutes
  total_marks: number;
  number_of_questions: number;
  allowed_languages: string[];
  max_submissions: number;
  negative_marking: boolean;
  randomized_order: boolean;
  visibility: string;
  status: 'Draft' | 'Scheduled' | 'Active' | 'Completed' | 'Archived';
  created_by: string;
  created_at: string;
  questions_count?: number;
  participants_count?: number;
  questions?: Question[];
}

export interface AssessmentSession {
  id: string;
  assessment_id: string;
  student_id: string;
  start_time: string;
  end_time?: string;
  remaining_seconds: number;
  is_submitted: boolean;
  submitted_at?: string;
  violation_count: number;
}

export interface TestResult {
  id?: string;
  test_case_id: string;
  order_index?: number;
  is_hidden: boolean;
  verdict: string;
  execution_time: number;
  memory_usage: number;
  marks_awarded: number;
  input_data?: string;
  expected_output?: string;
  actual_output?: string;
  error_message?: string;
}

export interface CodeRunResponse {
  status: string;
  verdict: string;
  total_test_cases: number;
  passed_test_cases: number;
  execution_time: number;
  memory_usage: number;
  compiler_output?: string;
  results: TestResult[];
}

export interface CodeQualityReport {
  quality_score: number;
  cyclomatic_complexity: number;
  maintainability_index: number;
  readability_score: number;
  detected_issues: Array<{ type: string; message: string; line?: number }>;
  improvement_suggestions: string[];
  explanation: string;
  estimated_time_complexity: string;
  estimated_space_complexity: string;
}

export interface Submission {
  id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  assessment_id?: string;
  question_id: string;
  question_title?: string;
  programming_language: string;
  verdict: string;
  score: number;
  passed_test_cases: number;
  total_test_cases: number;
  execution_time: number;
  memory_usage: number;
  compiler_output?: string;
  submitted_at: string;
  source_code?: string;
  test_results?: TestResult[];
  quality_report?: CodeQualityReport;
}

export interface PlagiarismReport {
  id: string;
  assessment_id: string;
  question_id: string;
  question_title?: string;
  submission_a_id: string;
  submission_b_id: string;
  student_a_name: string;
  student_b_name: string;
  student_a_email: string;
  student_b_email: string;
  similarity_score: number;
  token_similarity: number;
  tfidf_similarity: number;
  ast_similarity: number;
  matching_sections: Array<{ line_a: number; line_b: number; length: number; code_snippet: string }>;
  detection_method: string;
  review_status: 'Pending Review' | 'Under Investigation' | 'Confirmed Violation' | 'Not Plagiarism';
  reviewer_notes?: string;
  created_at: string;
  submission_a?: {
    id: string;
    student_name: string;
    student_email: string;
    source_code: string;
    verdict: string;
    score: number;
  };
  submission_b?: {
    id: string;
    student_name: string;
    student_email: string;
    source_code: string;
    verdict: string;
    score: number;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  is_read: boolean;
  link?: string;
  created_at: string;
}
