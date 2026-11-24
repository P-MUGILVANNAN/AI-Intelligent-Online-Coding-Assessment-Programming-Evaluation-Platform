from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel
from app.schemas.question import QuestionResponse

class AssessmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    category: str = "General Programming"
    difficulty: str = "Medium"
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration: int = 60 # minutes
    total_marks: int = 100
    number_of_questions: int = 1
    allowed_languages: Optional[List[str]] = ["python", "javascript", "cpp", "java", "c", "go", "csharp"]
    max_submissions: int = 10
    negative_marking: bool = False
    randomized_order: bool = False
    visibility: str = "Public"
    status: str = "Draft" # Draft, Scheduled, Active, Completed, Archived

class AssessmentCreate(AssessmentBase):
    question_ids: Optional[List[str]] = None

class AssessmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration: Optional[int] = None
    total_marks: Optional[int] = None
    number_of_questions: Optional[int] = None
    allowed_languages: Optional[List[str]] = None
    max_submissions: Optional[int] = None
    negative_marking: Optional[bool] = None
    randomized_order: Optional[bool] = None
    visibility: Optional[str] = None
    status: Optional[str] = None
    question_ids: Optional[List[str]] = None

class AssessmentResponse(AssessmentBase):
    id: str
    created_by: str
    created_at: datetime
    questions_count: Optional[int] = 0
    participants_count: Optional[int] = 0

    class Config:
        from_attributes = True

class AssessmentDetailResponse(AssessmentResponse):
    questions: List[QuestionResponse] = []

    class Config:
        from_attributes = True

class AssessmentAssignRequest(BaseModel):
    student_ids: List[str]

class AssessmentSessionResponse(BaseModel):
    id: str
    assessment_id: str
    student_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    remaining_seconds: int
    is_submitted: bool
    submitted_at: Optional[datetime] = None
    violation_count: int = 0

    class Config:
        from_attributes = True
