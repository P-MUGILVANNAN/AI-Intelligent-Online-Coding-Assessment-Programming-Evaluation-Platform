import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class CodeQualityReport(Base):
    __tablename__ = "code_quality_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    submission_id = Column(String(36), ForeignKey("submissions.id"), unique=True, nullable=False)
    quality_score = Column(Float, default=100.0) # 0 to 100
    cyclomatic_complexity = Column(Integer, default=1)
    maintainability_index = Column(Float, default=85.0)
    readability_score = Column(Float, default=90.0)
    detected_issues = Column(JSON, default=list) # [{"type": "warning", "message": "...", "line": 5}]
    improvement_suggestions = Column(JSON, default=list) # ["Consider using list comprehension", ...]
    explanation = Column(Text, nullable=True)
    estimated_time_complexity = Column(String(50), default="O(N)")
    estimated_space_complexity = Column(String(50), default="O(1)")
    analyzed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    submission = relationship("Submission", back_populates="quality_report")

class PlagiarismReport(Base):
    __tablename__ = "plagiarism_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assessment_id = Column(String(36), ForeignKey("assessments.id"), nullable=False)
    question_id = Column(String(36), ForeignKey("questions.id"), nullable=False)
    submission_a_id = Column(String(36), ForeignKey("submissions.id"), nullable=False)
    submission_b_id = Column(String(36), ForeignKey("submissions.id"), nullable=False)
    similarity_score = Column(Float, default=0.0) # composite percentage (0-100)
    token_similarity = Column(Float, default=0.0)
    tfidf_similarity = Column(Float, default=0.0)
    ast_similarity = Column(Float, default=0.0)
    matching_sections = Column(JSON, default=list) # [{"code_a": "...", "code_b": "...", "line_a": 1, "line_b": 1}]
    detection_method = Column(String(100), default="Hybrid Token+TF-IDF+AST")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    assessment = relationship("Assessment", back_populates="plagiarism_reports")
    submission_a = relationship("Submission", foreign_keys=[submission_a_id])
    submission_b = relationship("Submission", foreign_keys=[submission_b_id])
    reviews = relationship("PlagiarismReview", back_populates="report", cascade="all, delete-orphan")

class PlagiarismReview(Base):
    __tablename__ = "plagiarism_reviews"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    plagiarism_report_id = Column(String(36), ForeignKey("plagiarism_reports.id"), nullable=False)
    reviewed_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    review_status = Column(String(50), default="Pending Review") # Pending Review, Under Investigation, Confirmed Violation, Not Plagiarism
    reviewer_notes = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    report = relationship("PlagiarismReport", back_populates="reviews")
    reviewer = relationship("User")
