import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    instructions = Column(Text, nullable=True)
    category = Column(String(100), default="General Programming")
    difficulty = Column(String(20), default="Medium")
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    duration = Column(Integer, default=60) # duration in minutes
    total_marks = Column(Integer, default=100)
    number_of_questions = Column(Integer, default=1)
    allowed_languages = Column(JSON, default=lambda: ["python", "javascript", "cpp", "java", "c", "go", "csharp"])
    max_submissions = Column(Integer, default=10)
    negative_marking = Column(Boolean, default=False)
    randomized_order = Column(Boolean, default=False)
    visibility = Column(String(20), default="Public") # Public, Private, Restricted
    status = Column(String(20), default="Draft") # Draft, Scheduled, Active, Completed, Archived
    created_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    creator = relationship("User", back_populates="created_assessments")
    questions = relationship("AssessmentQuestion", back_populates="assessment", cascade="all, delete-orphan")
    assignments = relationship("AssessmentAssignment", back_populates="assessment", cascade="all, delete-orphan")
    sessions = relationship("AssessmentSession", back_populates="assessment", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="assessment")
    plagiarism_reports = relationship("PlagiarismReport", back_populates="assessment")

class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assessment_id = Column(String(36), ForeignKey("assessments.id"), nullable=False)
    question_id = Column(String(36), ForeignKey("questions.id"), nullable=False)
    order_index = Column(Integer, default=0)
    marks_override = Column(Integer, nullable=True)

    assessment = relationship("Assessment", back_populates="questions")
    question = relationship("Question", back_populates="assessment_associations")

class AssessmentAssignment(Base):
    __tablename__ = "assessment_assignments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assessment_id = Column(String(36), ForeignKey("assessments.id"), nullable=False)
    student_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    assigned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    assessment = relationship("Assessment", back_populates="assignments")

class AssessmentSession(Base):
    __tablename__ = "assessment_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assessment_id = Column(String(36), ForeignKey("assessments.id"), nullable=False)
    student_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    end_time = Column(DateTime, nullable=True)
    remaining_seconds = Column(Integer, default=3600)
    is_submitted = Column(Boolean, default=False)
    submitted_at = Column(DateTime, nullable=True)
    ip_address = Column(String(50), nullable=True)
    violation_count = Column(Integer, default=0)

    assessment = relationship("Assessment", back_populates="sessions")
    student = relationship("User", back_populates="assessment_sessions")
