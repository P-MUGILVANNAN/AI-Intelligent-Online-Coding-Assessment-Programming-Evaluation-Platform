from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class TestCaseBase(BaseModel):
    input_data: str
    expected_output: str
    marks: int = 10
    is_hidden: bool = False
    time_limit: float = 2.0
    memory_limit: int = 128
    order_index: int = 0

class TestCaseCreate(TestCaseBase):
    pass

class TestCaseResponse(BaseModel):
    id: str
    question_id: str
    input_data: Optional[str] = None
    expected_output: Optional[str] = None
    marks: int
    is_hidden: bool
    time_limit: float
    memory_limit: int
    order_index: int

    class Config:
        from_attributes = True

class QuestionBase(BaseModel):
    title: str
    description: str
    difficulty: str = "Medium" # Easy, Medium, Hard
    topic: str
    max_marks: int = 100
    expected_time_complexity: str = "O(N)"
    expected_space_complexity: str = "O(1)"
    input_format: str
    output_format: str
    constraints: str
    sample_input: str
    sample_output: str
    explanation: Optional[str] = None
    starter_code: Optional[Dict[str, str]] = None
    supported_languages: Optional[List[str]] = ["python", "javascript", "cpp", "java", "c", "go", "csharp"]

class QuestionCreate(QuestionBase):
    test_cases: Optional[List[TestCaseCreate]] = None

class QuestionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[str] = None
    topic: Optional[str] = None
    max_marks: Optional[int] = None
    expected_time_complexity: Optional[str] = None
    expected_space_complexity: Optional[str] = None
    input_format: Optional[str] = None
    output_format: Optional[str] = None
    constraints: Optional[str] = None
    sample_input: Optional[str] = None
    sample_output: Optional[str] = None
    explanation: Optional[str] = None
    starter_code: Optional[Dict[str, str]] = None
    supported_languages: Optional[List[str]] = None

class QuestionResponse(QuestionBase):
    id: str
    created_by: Optional[str] = None
    created_at: datetime
    test_cases: List[TestCaseResponse] = []

    class Config:
        from_attributes = True
