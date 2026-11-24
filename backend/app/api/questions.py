from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.question import Question, QuestionTestCase
from app.schemas.question import (
    QuestionResponse, QuestionCreate, QuestionUpdate,
    TestCaseCreate, TestCaseResponse
)
from app.api.deps import get_current_user, require_instructor_or_admin

router = APIRouter(prefix="/questions", tags=["Question Management"])

def sanitize_question_for_role(q: Question, is_staff: bool) -> dict:
    q_dict = {
        "id": q.id,
        "title": q.title,
        "description": q.description,
        "difficulty": q.difficulty,
        "topic": q.topic,
        "max_marks": q.max_marks,
        "expected_time_complexity": q.expected_time_complexity,
        "expected_space_complexity": q.expected_space_complexity,
        "input_format": q.input_format,
        "output_format": q.output_format,
        "constraints": q.constraints,
        "sample_input": q.sample_input,
        "sample_output": q.sample_output,
        "explanation": q.explanation,
        "starter_code": q.starter_code,
        "supported_languages": q.supported_languages,
        "created_by": q.created_by,
        "created_at": q.created_at,
        "test_cases": []
    }
    for tc in q.test_cases:
        tc_dict = {
            "id": tc.id,
            "question_id": tc.question_id,
            "marks": tc.marks,
            "is_hidden": tc.is_hidden,
            "time_limit": tc.time_limit,
            "memory_limit": tc.memory_limit,
            "order_index": tc.order_index,
            # Mask hidden test case payload for students
            "input_data": tc.input_data if (is_staff or not tc.is_hidden) else "[Hidden Test Case]",
            "expected_output": tc.expected_output if (is_staff or not tc.is_hidden) else "[Hidden Output]"
        }
        q_dict["test_cases"].append(tc_dict)
    return q_dict

@router.get("", response_model=List[QuestionResponse])
def list_questions(
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Question)
    if topic:
        query = query.filter(Question.topic == topic)
    if difficulty:
        query = query.filter(Question.difficulty == difficulty)
    if search:
        query = query.filter(
            (Question.title.ilike(f"%{search}%")) |
            (Question.description.ilike(f"%{search}%"))
        )
    questions = query.offset(offset).limit(limit).all()

    is_staff = current_user.role and current_user.role.name in ("Administrator", "Instructor")
    return [sanitize_question_for_role(q, is_staff) for q in questions]

@router.get("/{id}", response_model=QuestionResponse)
def get_question(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Question).filter(Question.id == id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    
    is_staff = current_user.role and current_user.role.name in ("Administrator", "Instructor")
    return sanitize_question_for_role(q, is_staff)

@router.post("", response_model=QuestionResponse)
def create_question(
    req: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor_or_admin)
):
    q = Question(
        title=req.title,
        description=req.description,
        difficulty=req.difficulty,
        topic=req.topic,
        max_marks=req.max_marks,
        expected_time_complexity=req.expected_time_complexity,
        expected_space_complexity=req.expected_space_complexity,
        input_format=req.input_format,
        output_format=req.output_format,
        constraints=req.constraints,
        sample_input=req.sample_input,
        sample_output=req.sample_output,
        explanation=req.explanation,
        starter_code=req.starter_code or {
            "python": "def solve():\n    # Write your solution here\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
            "javascript": "const fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    // Write your solution here\n}\n\nsolve();\n",
            "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n"
        },
        supported_languages=req.supported_languages,
        created_by=current_user.id
    )
    db.add(q)
    db.commit()
    db.refresh(q)

    if req.test_cases:
        for idx, tc in enumerate(req.test_cases):
            db_tc = QuestionTestCase(
                question_id=q.id,
                input_data=tc.input_data,
                expected_output=tc.expected_output,
                marks=tc.marks,
                is_hidden=tc.is_hidden,
                time_limit=tc.time_limit,
                memory_limit=tc.memory_limit,
                order_index=idx
            )
            db.add(db_tc)
        db.commit()
        db.refresh(q)

    return sanitize_question_for_role(q, is_staff=True)

@router.put("/{id}", response_model=QuestionResponse)
def update_question(
    id: str,
    req: QuestionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor_or_admin)
):
    q = db.query(Question).filter(Question.id == id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    for key, val in req.model_dump(exclude_unset=True).items():
        setattr(q, key, val)

    db.commit()
    db.refresh(q)
    return sanitize_question_for_role(q, is_staff=True)

@router.delete("/{id}")
def delete_question(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor_or_admin)
):
    q = db.query(Question).filter(Question.id == id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(q)
    db.commit()
    return {"message": "Question deleted successfully"}

@router.post("/{id}/test-cases", response_model=TestCaseResponse)
def add_test_case(
    id: str,
    req: TestCaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor_or_admin)
):
    q = db.query(Question).filter(Question.id == id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    tc = QuestionTestCase(
        question_id=q.id,
        input_data=req.input_data,
        expected_output=req.expected_output,
        marks=req.marks,
        is_hidden=req.is_hidden,
        time_limit=req.time_limit,
        memory_limit=req.memory_limit,
        order_index=req.order_index
    )
    db.add(tc)
    db.commit()
    db.refresh(tc)
    return tc

@router.delete("/test-cases/{test_case_id}")
def delete_test_case(
    test_case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor_or_admin)
):
    tc = db.query(QuestionTestCase).filter(QuestionTestCase.id == test_case_id).first()
    if not tc:
        raise HTTPException(status_code=404, detail="Test case not found")
    db.delete(tc)
    db.commit()
    return {"message": "Test case deleted successfully"}
