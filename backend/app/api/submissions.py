from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.submission import Submission, SubmissionTestResult
from app.schemas.submission import SubmissionResponse, SubmissionDetailResponse, TestResultResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/submissions", tags=["Submissions"])

@router.get("", response_model=List[SubmissionResponse])
def list_submissions(
    assessment_id: Optional[str] = None,
    question_id: Optional[str] = None,
    student_id: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Submission)
    is_staff = current_user.role and current_user.role.name in ("Administrator", "Instructor")
    
    if not is_staff:
        # Students only see their own submissions
        query = query.filter(Submission.student_id == current_user.id)
    elif student_id:
        query = query.filter(Submission.student_id == student_id)

    if assessment_id:
        query = query.filter(Submission.assessment_id == assessment_id)
    if question_id:
        query = query.filter(Submission.question_id == question_id)

    return query.order_by(Submission.submitted_at.desc()).offset(offset).limit(limit).all()

@router.get("/{id}", response_model=SubmissionDetailResponse)
def get_submission(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sub = db.query(Submission).filter(Submission.id == id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    is_staff = current_user.role and current_user.role.name in ("Administrator", "Instructor")
    if not is_staff and sub.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied to view this submission")

    # Build results list
    test_results = []
    for tr in sub.test_results:
        test_results.append({
            "id": tr.id,
            "test_case_id": tr.test_case_id or "default",
            "is_hidden": tr.is_hidden,
            "verdict": tr.verdict,
            "execution_time": tr.execution_time,
            "memory_usage": tr.memory_usage,
            "marks_awarded": tr.marks_awarded,
            "input_data": tr.test_case.input_data if (tr.test_case and (is_staff or not tr.is_hidden)) else "[Hidden]",
            "expected_output": tr.test_case.expected_output if (tr.test_case and (is_staff or not tr.is_hidden)) else "[Hidden]",
            "actual_output": tr.actual_output if (is_staff or not tr.is_hidden) else "[Hidden]",
            "error_message": tr.error_message
        })

    qr_dict = None
    if sub.quality_report:
        qr_dict = {
            "quality_score": sub.quality_report.quality_score,
            "cyclomatic_complexity": sub.quality_report.cyclomatic_complexity,
            "maintainability_index": sub.quality_report.maintainability_index,
            "readability_score": sub.quality_report.readability_score,
            "detected_issues": sub.quality_report.detected_issues,
            "improvement_suggestions": sub.quality_report.improvement_suggestions,
            "explanation": sub.quality_report.explanation,
            "estimated_time_complexity": sub.quality_report.estimated_time_complexity,
            "estimated_space_complexity": sub.quality_report.estimated_space_complexity
        }

    return {
        "id": sub.id,
        "student_id": sub.student_id,
        "assessment_id": sub.assessment_id,
        "question_id": sub.question_id,
        "programming_language": sub.programming_language,
        "verdict": sub.verdict,
        "score": sub.score,
        "passed_test_cases": sub.passed_test_cases,
        "total_test_cases": sub.total_test_cases,
        "execution_time": sub.execution_time,
        "memory_usage": sub.memory_usage,
        "compiler_output": sub.compiler_output,
        "submitted_at": sub.submitted_at,
        "source_code": sub.source_code,
        "student_name": sub.student.full_name if sub.student else "Student",
        "student_email": sub.student.email if sub.student else "student@codeeval.ai",
        "question_title": sub.question.title if sub.question else "Question",
        "test_results": test_results,
        "quality_report": qr_dict
    }

@router.get("/{id}/results", response_model=List[TestResultResponse])
def get_submission_test_results(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sub = db.query(Submission).filter(Submission.id == id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    is_staff = current_user.role and current_user.role.name in ("Administrator", "Instructor")
    if not is_staff and sub.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied")

    results = []
    for tr in sub.test_results:
        results.append({
            "id": tr.id,
            "test_case_id": tr.test_case_id or "default",
            "is_hidden": tr.is_hidden,
            "verdict": tr.verdict,
            "execution_time": tr.execution_time,
            "memory_usage": tr.memory_usage,
            "marks_awarded": tr.marks_awarded,
            "input_data": tr.test_case.input_data if (tr.test_case and (is_staff or not tr.is_hidden)) else "[Hidden]",
            "expected_output": tr.test_case.expected_output if (tr.test_case and (is_staff or not tr.is_hidden)) else "[Hidden]",
            "actual_output": tr.actual_output if (is_staff or not tr.is_hidden) else "[Hidden]",
            "error_message": tr.error_message
        })
    return results
