from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.question import Question
from app.models.assessment import Assessment
from app.models.submission import Submission
from app.models.ai_report import PlagiarismReport, PlagiarismReview
from app.schemas.ai_report import PlagiarismReportResponse, PlagiarismReviewCreate
from app.api.deps import require_instructor_or_admin
from app.ai.plagiarism import HybridPlagiarismDetector

router = APIRouter(prefix="/plagiarism", tags=["Plagiarism Detection"])

class AnalyzePlagiarismRequest(BaseModel):
    assessment_id: Optional[str] = None
    question_id: Optional[str] = None
    similarity_threshold: float = 60.0

@router.post("/analyze")
def trigger_plagiarism_analysis(
    req: AnalyzePlagiarismRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor_or_admin)
):
    query = db.query(Submission)
    if req.assessment_id:
        query = query.filter(Submission.assessment_id == req.assessment_id)
    if req.question_id:
        query = query.filter(Submission.question_id == req.question_id)

    submissions = query.all()
    if len(submissions) < 2:
        return {"message": "At least 2 submissions are required to perform cross-similarity comparison.", "flagged_pairs": 0}

    # Group submissions by question_id
    from collections import defaultdict
    by_question = defaultdict(list)
    for s in submissions:
        by_question[s.question_id].append({
            "id": s.id,
            "student_id": s.student_id,
            "student_name": s.student.full_name if s.student else "Student",
            "source_code": s.source_code,
            "programming_language": s.programming_language
        })

    flagged_count = 0
    new_reports = []

    for q_id, q_subs in by_question.items():
        if len(q_subs) < 2:
            continue
        
        q = db.query(Question).filter(Question.id == q_id).first()
        starter_code = ""
        if q and q.starter_code and isinstance(q.starter_code, dict):
            starter_code = q.starter_code.get("python", "")

        pairs = HybridPlagiarismDetector.batch_compare(
            submissions=q_subs,
            starter_code=starter_code,
            threshold=req.similarity_threshold
        )

        for p in pairs:
            # Check if report already exists for this pair
            existing = db.query(PlagiarismReport).filter(
                PlagiarismReport.question_id == q_id,
                ((PlagiarismReport.submission_a_id == p["submission_a_id"]) & (PlagiarismReport.submission_b_id == p["submission_b_id"])) |
                ((PlagiarismReport.submission_a_id == p["submission_b_id"]) & (PlagiarismReport.submission_b_id == p["submission_a_id"]))
            ).first()

            if not existing:
                rep = PlagiarismReport(
                    assessment_id=req.assessment_id or (submissions[0].assessment_id if submissions else ""),
                    question_id=q_id,
                    submission_a_id=p["submission_a_id"],
                    submission_b_id=p["submission_b_id"],
                    similarity_score=p["similarity_score"],
                    token_similarity=p["token_similarity"],
                    tfidf_similarity=p["tfidf_similarity"],
                    ast_similarity=p["ast_similarity"],
                    matching_sections=p["matching_sections"],
                    detection_method=p["detection_method"]
                )
                db.add(rep)
                new_reports.append(rep)
                flagged_count += 1

    db.commit()
    return {
        "message": f"Plagiarism analysis completed. Identified {flagged_count} suspect submission pairs exceeding {req.similarity_threshold}% hybrid similarity threshold.",
        "flagged_pairs": flagged_count
    }

@router.get("/reports", response_model=List[PlagiarismReportResponse])
def list_plagiarism_reports(
    assessment_id: Optional[str] = None,
    question_id: Optional[str] = None,
    min_similarity: Optional[float] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor_or_admin)
):
    query = db.query(PlagiarismReport)
    if assessment_id:
        query = query.filter(PlagiarismReport.assessment_id == assessment_id)
    if question_id:
        query = query.filter(PlagiarismReport.question_id == question_id)
    if min_similarity is not None:
        query = query.filter(PlagiarismReport.similarity_score >= min_similarity)

    reports = query.order_by(PlagiarismReport.similarity_score.desc()).offset(offset).limit(limit).all()
    results = []
    for r in reports:
        sub_a = r.submission_a
        sub_b = r.submission_b
        latest_review = r.reviews[-1] if r.reviews else None
        
        results.append({
            "id": r.id,
            "assessment_id": r.assessment_id,
            "question_id": r.question_id,
            "submission_a_id": r.submission_a_id,
            "submission_b_id": r.submission_b_id,
            "student_a_name": sub_a.student.full_name if sub_a and sub_a.student else "Student A",
            "student_b_name": sub_b.student.full_name if sub_b and sub_b.student else "Student B",
            "student_a_email": sub_a.student.email if sub_a and sub_a.student else "student_a@codeeval.ai",
            "student_b_email": sub_b.student.email if sub_b and sub_b.student else "student_b@codeeval.ai",
            "question_title": sub_a.question.title if sub_a and sub_a.question else "Question",
            "similarity_score": r.similarity_score,
            "token_similarity": r.token_similarity,
            "tfidf_similarity": r.tfidf_similarity,
            "ast_similarity": r.ast_similarity,
            "matching_sections": r.matching_sections or [],
            "detection_method": r.detection_method,
            "review_status": latest_review.review_status if latest_review else "Pending Review",
            "reviewer_notes": latest_review.reviewer_notes if latest_review else None,
            "created_at": r.created_at
        })
    return results

@router.get("/reports/{id}")
def get_plagiarism_report(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor_or_admin)
):
    r = db.query(PlagiarismReport).filter(PlagiarismReport.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Plagiarism report not found")

    sub_a = r.submission_a
    sub_b = r.submission_b
    latest_review = r.reviews[-1] if r.reviews else None

    return {
        "id": r.id,
        "assessment_id": r.assessment_id,
        "question_id": r.question_id,
        "similarity_score": r.similarity_score,
        "token_similarity": r.token_similarity,
        "tfidf_similarity": r.tfidf_similarity,
        "ast_similarity": r.ast_similarity,
        "detection_method": r.detection_method,
        "matching_sections": r.matching_sections or [],
        "created_at": r.created_at,
        "review_status": latest_review.review_status if latest_review else "Pending Review",
        "reviewer_notes": latest_review.reviewer_notes if latest_review else None,
        "submission_a": {
            "id": sub_a.id if sub_a else "",
            "student_name": sub_a.student.full_name if sub_a and sub_a.student else "Student A",
            "student_email": sub_a.student.email if sub_a and sub_a.student else "",
            "submitted_at": sub_a.submitted_at if sub_a else None,
            "source_code": sub_a.source_code if sub_a else "",
            "verdict": sub_a.verdict if sub_a else "",
            "score": sub_a.score if sub_a else 0
        },
        "submission_b": {
            "id": sub_b.id if sub_b else "",
            "student_name": sub_b.student.full_name if sub_b and sub_b.student else "Student B",
            "student_email": sub_b.student.email if sub_b and sub_b.student else "",
            "submitted_at": sub_b.submitted_at if sub_b else None,
            "source_code": sub_b.source_code if sub_b else "",
            "verdict": sub_b.verdict if sub_b else "",
            "score": sub_b.score if sub_b else 0
        }
    }

@router.put("/reports/{id}/review")
def review_plagiarism_report(
    id: str,
    req: PlagiarismReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor_or_admin)
):
    r = db.query(PlagiarismReport).filter(PlagiarismReport.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Plagiarism report not found")

    rev = PlagiarismReview(
        plagiarism_report_id=r.id,
        reviewed_by=current_user.id,
        review_status=req.review_status,
        reviewer_notes=req.reviewer_notes,
        reviewed_at=datetime.now(timezone.utc)
    )
    db.add(rev)
    db.commit()
    return {"message": "Review recorded successfully", "review_status": req.review_status}
