from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User
from app.models.assessment import Assessment, AssessmentSession
from app.models.submission import Submission
from app.services.report_service import ReportService
from app.api.deps import oauth2_scheme

router = APIRouter(prefix="/reports", tags=["Report Generation"])

def get_report_user(
    token_query: Optional[str] = Query(None, alias="token"),
    auth_token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Authenticates user from either Authorization header or ?token= query parameter."""
    token = auth_token or token_query
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
        )
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive or invalid user")
    return user

@router.get("/assessment/{id}")
def get_assessment_report(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_report_user)
):
    is_staff = current_user.role and current_user.role.name in ("Administrator", "Instructor")
    if not is_staff:
        raise HTTPException(status_code=403, detail="Permission denied")

    a = db.query(Assessment).filter(Assessment.id == id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")

    sessions = a.sessions
    submissions = a.submissions

    participants = []
    for s in sessions:
        student = s.student
        student_subs = [sub for sub in submissions if sub.student_id == s.student_id]
        total_score = sum(sub.score for sub in student_subs)
        avg_score = total_score / len(student_subs) if student_subs else 0
        pct = (total_score / a.total_marks) * 100 if a.total_marks > 0 else 0

        participants.append({
            "student_id": s.student_id,
            "student_name": student.full_name if student else "Student",
            "student_email": student.email if student else "",
            "score": round(total_score, 1),
            "percentage": round(pct, 1),
            "status": "Completed" if s.is_submitted else "In Progress",
            "violations": s.violation_count,
            "submitted_at": s.submitted_at
        })

    return {
        "assessment_id": a.id,
        "title": a.title,
        "category": a.category,
        "total_marks": a.total_marks,
        "duration": a.duration,
        "total_participants": len(sessions),
        "results": participants
    }

@router.get("/export/{id}")
def export_assessment_csv(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_report_user)
):
    is_staff = current_user.role and current_user.role.name in ("Administrator", "Instructor")
    if not is_staff:
        raise HTTPException(status_code=403, detail="Permission denied")

    a = db.query(Assessment).filter(Assessment.id == id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")

    rep_data = get_assessment_report(id=id, db=db, current_user=current_user)
    csv_str = ReportService.generate_assessment_csv(
        assessment_title=a.title,
        results=rep_data["results"]
    )

    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=assessment_{a.id}_report.csv"}
    )

@router.get("/student/{id}/pdf")
def export_student_pdf(
    id: str,
    assessment_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_report_user)
):
    student = db.query(User).filter(User.id == id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    is_staff = current_user.role and current_user.role.name in ("Administrator", "Instructor")
    if not is_staff and current_user.id != id:
        raise HTTPException(status_code=403, detail="Permission denied to access this report")

    # Fetch submissions
    q_subs = db.query(Submission).filter(Submission.student_id == id)
    assm_title = "Overall Programming Assessment"
    total_marks = 100.0

    if assessment_id:
        q_subs = q_subs.filter(Submission.assessment_id == assessment_id)
        assm = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if assm:
            assm_title = assm.title
            total_marks = assm.total_marks

    submissions = q_subs.all()
    obtained_marks = sum(s.score for s in submissions)
    pct = (obtained_marks / total_marks) * 100 if total_marks > 0 else 0

    sub_data = []
    quality_data = []
    for s in submissions:
        sub_data.append({
            "question_title": s.question.title if s.question else "Problem",
            "programming_language": s.programming_language,
            "verdict": s.verdict,
            "passed_test_cases": s.passed_test_cases,
            "total_test_cases": s.total_test_cases,
            "execution_time": s.execution_time,
            "memory_usage": s.memory_usage,
            "score": s.score
        })
        if s.quality_report:
            quality_data.append({
                "question_title": s.question.title if s.question else "Problem",
                "quality_score": s.quality_report.quality_score,
                "complexity": s.quality_report.cyclomatic_complexity,
                "time_complexity": s.quality_report.estimated_time_complexity,
                "explanation": s.quality_report.explanation,
                "suggestions": s.quality_report.improvement_suggestions or []
            })

    pdf_bytes = ReportService.generate_student_pdf(
        student_name=student.full_name,
        assessment_title=assm_title,
        total_marks=total_marks,
        obtained_marks=round(obtained_marks, 1),
        percentage=round(pct, 1),
        submissions_data=sub_data,
        quality_feedback=quality_data
    )

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=codeeval_report_{student.id}.pdf"}
    )
