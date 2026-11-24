import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    assessment_id = Column(String(36), ForeignKey("assessments.id"), nullable=True)
    question_id = Column(String(36), ForeignKey("questions.id"), nullable=False)
    source_code = Column(Text, nullable=False)
    programming_language = Column(String(30), nullable=False) # python, javascript, cpp, java, c, go, csharp
    verdict = Column(String(50), default="Pending") # Accepted, Wrong Answer, Compilation Error, Runtime Error, Time Limit Exceeded, Memory Limit Exceeded, Internal Evaluation Error
    score = Column(Float, default=0.0)
    passed_test_cases = Column(Integer, default=0)
    total_test_cases = Column(Integer, default=0)
    execution_time = Column(Float, default=0.0) # in ms or s
    memory_usage = Column(Float, default=0.0) # in MB or KB
    compiler_output = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("User", back_populates="submissions")
    assessment = relationship("Assessment", back_populates="submissions")
    question = relationship("Question", back_populates="submissions")
    test_results = relationship("SubmissionTestResult", back_populates="submission", cascade="all, delete-orphan")
    quality_report = relationship("CodeQualityReport", back_populates="submission", uselist=False, cascade="all, delete-orphan")

class SubmissionTestResult(Base):
    __tablename__ = "submission_test_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    submission_id = Column(String(36), ForeignKey("submissions.id"), nullable=False)
    test_case_id = Column(String(36), ForeignKey("question_test_cases.id"), nullable=False)
    verdict = Column(String(50), default="Pending")
    execution_time = Column(Float, default=0.0)
    memory_usage = Column(Float, default=0.0)
    marks_awarded = Column(Float, default=0.0)
    actual_output = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    is_hidden = Column(Boolean, default=False)

    submission = relationship("Submission", back_populates="test_results")
    test_case = relationship("QuestionTestCase", back_populates="test_results")
