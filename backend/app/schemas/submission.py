from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class CodeRunRequest(BaseModel):
    source_code: str
    programming_language: str
    question_id: str
    custom_input: Optional[str] = None

class CodeSubmitRequest(BaseModel):
    source_code: str
    programming_language: str
    question_id: str
    assessment_id: Optional[str] = None

class TestResultResponse(BaseModel):
    id: Optional[str] = None
    test_case_id: str
    order_index: Optional[int] = 0
    is_hidden: bool
    verdict: str # Passed, Failed, Time Limit Exceeded, Memory Limit Exceeded, Runtime Error
    execution_time: float
    memory_usage: float
    marks_awarded: float
    expected_output: Optional[str] = None # Only populated for public test cases
    actual_output: Optional[str] = None   # Only populated for public test cases or sanitized
    input_data: Optional[str] = None      # Only populated for public test cases
    error_message: Optional[str] = None

class CodeRunResponse(BaseModel):
    status: str # Completed, Compilation Error, Runtime Error
    verdict: str
    total_test_cases: int
    passed_test_cases: int
    execution_time: float
    memory_usage: float
    compiler_output: Optional[str] = None
    results: List[TestResultResponse]

class SubmissionResponse(BaseModel):
    id: str
    student_id: str
    assessment_id: Optional[str] = None
    question_id: str
    programming_language: str
    verdict: str
    score: float
    passed_test_cases: int
    total_test_cases: int
    execution_time: float
    memory_usage: float
    compiler_output: Optional[str] = None
    submitted_at: datetime

    class Config:
        from_attributes = True

class SubmissionDetailResponse(SubmissionResponse):
    source_code: str
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    question_title: Optional[str] = None
    test_results: List[TestResultResponse] = []
    quality_report: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
