import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Question(Base):
    __tablename__ = "questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String(20), default="Medium") # Easy, Medium, Hard
    topic = Column(String(50), nullable=False) # Arrays, Strings, Sorting, Searching, Recursion, Dynamic Programming, Graphs, Trees, Greedy Algorithms, Mathematics, Data Structures
    max_marks = Column(Integer, default=100)
    expected_time_complexity = Column(String(50), default="O(N)")
    expected_space_complexity = Column(String(50), default="O(1)")
    input_format = Column(Text, nullable=False)
    output_format = Column(Text, nullable=False)
    constraints = Column(Text, nullable=False)
    sample_input = Column(Text, nullable=False)
    sample_output = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    starter_code = Column(JSON, nullable=True) # {"python": "...", "javascript": "...", "java": "...", "cpp": "..."}
    supported_languages = Column(JSON, default=lambda: ["python", "javascript", "cpp", "java", "c", "go", "csharp"])
    created_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    creator = relationship("User", back_populates="created_questions")
    test_cases = relationship("QuestionTestCase", back_populates="question", cascade="all, delete-orphan")
    assessment_associations = relationship("AssessmentQuestion", back_populates="question")
    submissions = relationship("Submission", back_populates="question")

class QuestionTestCase(Base):
    __tablename__ = "question_test_cases"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_id = Column(String(36), ForeignKey("questions.id"), nullable=False)
    input_data = Column(Text, nullable=False)
    expected_output = Column(Text, nullable=False)
    marks = Column(Integer, default=10)
    is_hidden = Column(Boolean, default=False)
    time_limit = Column(Float, default=2.0) # seconds
    memory_limit = Column(Integer, default=128) # MB
    order_index = Column(Integer, default=0)

    question = relationship("Question", back_populates="test_cases")
    test_results = relationship("SubmissionTestResult", back_populates="test_case")
