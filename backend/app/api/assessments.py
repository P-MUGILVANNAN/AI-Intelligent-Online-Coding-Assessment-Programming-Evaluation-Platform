from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.assessment import Assessment, AssessmentQuestion, AssessmentAssignment, AssessmentSession
from app.models.question import Question
from app.schemas.assessment import (
    AssessmentResponse, AssessmentDetailResponse, AssessmentCreate,
    AssessmentUpdate, AssessmentAssignRequest, AssessmentSessionResponse
)
from app.api.deps import get_current_user, require_instructor_or_admin
from app.api.questions import sanitize_question_for_role

router = APIRouter(prefix="/assessments", tags=["Assessment Management"])

def format_assessment_summary(a: Assessment) -> dict:
    return {
        "id": a.id,
        "title": a.title,
        "description": a.description,
        "instructions": a.instructions,
        "category": a.category,
        "difficulty": a.difficulty,
        "start_time": a.start_time,
        "end_time": a.end_time,
        "duration": a.duration,
        "total_marks": a.total_marks,
        "number_of_questions": len(a.questions) if a.questions else a.number_of_questions,
        "allowed_languages": a.allowed_languages,
        "max_submissions": a.max_submissions,
        "negative_marking": a.negative_marking,
        "randomized_order": a.randomized_order,
        "visibility": a.visibility,
        "status": a.status,
        "created_by": a.created_by,
        "created_at": a.created_at,
        "questions_count": len(a.questions) if a.questions else 0,
        "participants_count": len(a.sessions) if a.sessions else 0
    }

@router.get("", response_model=List[AssessmentResponse])
def list_assessments(
    status: Optional[str] = None,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Assessment)
    is_staff = current_user.role and current_user.role.name in ("Administrator", "Instructor")
    
    # Students only see active/scheduled public or assigned assessments
    if not is_staff:
        query = query.filter(Assessment.status.in_(["Active", "Scheduled", "Completed"]))
        query = query.filter(Assessment.visibility == "Public")

    if status:
        query = query.filter(Assessment.status == status)
    if category:
        query = query.filter(Assessment.category == category)
    if difficulty:
        query = query.filter(Assessment.difficulty == difficulty)
    if search:
        query = query.filter(
            (Assessment.title.ilike(f"%{search}%")) |
            (Assessment.description.ilike(f"%{search}%"))
        )

    assessments = query.order_by(Assessment.created_at.desc()).offset(offset).limit(limit).all()
    return [format_assessment_summary(a) for a in assessments]

@router.get("/{id}", response_model=AssessmentDetailResponse)
def get_assessment(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    a = db.query(Assessment).filter(Assessment.id == id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")

    is_staff = current_user.role and current_user.role.name in ("Administrator", "Instructor")
    resp = format_assessment_summary(a)
    
    questions = []
    for aq in a.questions:
        q = aq.question
        if q:
            questions.append(sanitize_question_for_role(q, is_staff))
    resp["questions"] = questions
    return resp

@router.post("", response_model=AssessmentResponse)
def create_assessment(
    req: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor_or_admin)
):
    a = Assessment(
        title=req.title,
        description=req.description,
        instructions=req.instructions,
        category=req.category,
        difficulty=req.difficulty,
        start_time=req.start_time or datetime.now(timezone.utc),
        end_time=req.end_time or (datetime.now(timezone.utc) + timedelta(days=7)),
        duration=req.duration,
        total_marks=req.total_marks,
        number_of_questions=req.number_of_questions,
        allowed_languages=req.allowed_languages,
        max_submissions=req.max_submissions,
        negative_marking=req.negative_marking,
        randomized_order=req.randomized_order,
        visibility=req.visibility,
        status=req.status,
        created_by=current_user.id
    )
    db.add(a)
    db.commit()
    db.refresh(a)

    if req.question_ids:
        for idx, qid in enumerate(req.question_ids):
            assoc = AssessmentQuestion(
                assessment_id=a.id,
                question_id=qid,
                order_index=idx
            )
            db.add(assoc)
        db.commit()
        db.refresh(a)

    return format_assessment_summary(a)

@router.put("/{id}", response_model=AssessmentResponse)
def update_assessment(
    id: str,
    req: AssessmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor_or_admin)
):
    a = db.query(Assessment).filter(Assessment.id == id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")

    data = req.model_dump(exclude_unset=True)
    q_ids = data.pop("question_ids", None)

    for k, v in data.items():
        setattr(a, k, v)

    if q_ids is not None:
        db.query(AssessmentQuestion).filter(AssessmentQuestion.assessment_id == a.id).delete()
        for idx, qid in enumerate(q_ids):
            assoc = AssessmentQuestion(
                assessment_id=a.id,
                question_id=qid,
                order_index=idx
            )
            db.add(assoc)

    db.commit()
    db.refresh(a)
    return format_assessment_summary(a)

@router.delete("/{id}")
def delete_assessment(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor_or_admin)
):
    a = db.query(Assessment).filter(Assessment.id == id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")
    db.delete(a)
    db.commit()
    return {"message": "Assessment deleted successfully"}

@router.post("/{id}/start", response_model=AssessmentSessionResponse)
def start_assessment_session(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    a = db.query(Assessment).filter(Assessment.id == id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")

    session = db.query(AssessmentSession).filter(
        AssessmentSession.assessment_id == id,
        AssessmentSession.student_id == current_user.id
    ).first()

    if session:
        # Interrupted session resume support
        if session.is_submitted:
            return session
        # Check elapsed time
        elapsed = (datetime.now(timezone.utc) - session.start_time.replace(tzinfo=timezone.utc)).total_seconds()
        total_allowed = a.duration * 60
        remaining = max(0, int(total_allowed - elapsed))
        session.remaining_seconds = remaining
        if remaining == 0:
            session.is_submitted = True
            session.submitted_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(session)
        return session

    # Create new session
    session = AssessmentSession(
        assessment_id=id,
        student_id=current_user.id,
        start_time=datetime.now(timezone.utc),
        remaining_seconds=a.duration * 60,
        is_submitted=False
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.get("/{id}/session", response_model=Optional[AssessmentSessionResponse])
def get_assessment_session(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(AssessmentSession).filter(
        AssessmentSession.assessment_id == id,
        AssessmentSession.student_id == current_user.id
    ).first()
    return session

@router.post("/{id}/finish")
def finish_assessment_session(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(AssessmentSession).filter(
        AssessmentSession.assessment_id == id,
        AssessmentSession.student_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.is_submitted = True
    session.submitted_at = datetime.now(timezone.utc)
    session.remaining_seconds = 0
    db.commit()
    return {"message": "Assessment submitted successfully"}

@router.post("/{id}/violation")
def record_session_violation(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(AssessmentSession).filter(
        AssessmentSession.assessment_id == id,
        AssessmentSession.student_id == current_user.id
    ).first()
    if session:
        session.violation_count += 1
        db.commit()
        return {"violation_count": session.violation_count}
    return {"violation_count": 0}

@router.get("/{id}/participants")
def list_assessment_participants(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor_or_admin)
):
    sessions = db.query(AssessmentSession).filter(AssessmentSession.assessment_id == id).all()
    results = []
    for s in sessions:
        student = s.student
        results.append({
            "session_id": s.id,
            "student_id": s.student_id,
            "student_name": student.full_name if student else "Unknown",
            "student_email": student.email if student else "Unknown",
            "start_time": s.start_time,
            "submitted_at": s.submitted_at,
            "remaining_seconds": s.remaining_seconds,
            "is_submitted": s.is_submitted,
            "violation_count": s.violation_count
        })
    return results
