from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class CodeQualityResponse(BaseModel):
    id: Optional[str] = None
    submission_id: str
    quality_score: float # 0 to 100
    cyclomatic_complexity: int
    maintainability_index: float
    readability_score: float
    detected_issues: List[Dict[str, Any]] = []
    improvement_suggestions: List[str] = []
    explanation: Optional[str] = None
    estimated_time_complexity: str = "O(N)"
    estimated_space_complexity: str = "O(1)"
    analyzed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PlagiarismReportResponse(BaseModel):
    id: str
    assessment_id: str
    question_id: str
    submission_a_id: str
    submission_b_id: str
    student_a_name: Optional[str] = None
    student_b_name: Optional[str] = None
    student_a_email: Optional[str] = None
    student_b_email: Optional[str] = None
    question_title: Optional[str] = None
    similarity_score: float
    token_similarity: float
    tfidf_similarity: float
    ast_similarity: float
    matching_sections: List[Dict[str, Any]] = []
    detection_method: str
    review_status: str = "Pending Review"
    reviewer_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PlagiarismReviewCreate(BaseModel):
    review_status: str # Pending Review, Under Investigation, Confirmed Violation, Not Plagiarism
    reviewer_notes: Optional[str] = None
