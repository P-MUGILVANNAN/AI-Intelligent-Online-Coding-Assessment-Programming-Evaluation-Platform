from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.question import Question, QuestionTestCase
from app.models.assessment import Assessment, AssessmentSession
from app.models.submission import Submission, SubmissionTestResult
from app.models.ai_report import CodeQualityReport
from app.models.analytics import StudentPerformance, ActivityLog
from app.schemas.submission import CodeRunRequest, CodeRunResponse, CodeSubmitRequest, SubmissionResponse, SubmissionDetailResponse
from app.api.deps import get_current_user
from app.execution.runner import LocalSandboxExecutor, evaluate_test_case
from app.ai.quality import CodeQualityAnalyzer

router = APIRouter(prefix="/code", tags=["Code Execution"])

@router.post("/run", response_model=CodeRunResponse)
def run_code(
    req: CodeRunRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Executes student code against authorized public test cases or custom input.
    Does NOT affect marks or persistent submission history.
    """
    q = db.query(Question).filter(Question.id == req.question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    results = []
    total_time = 0.0
    max_memory = 0.0
    overall_verdict = "Accepted"
    passed_cases = 0

    if req.custom_input is not None and req.custom_input.strip():
        # Custom input execution
        res = LocalSandboxExecutor.execute(
            language=req.programming_language,
            source_code=req.source_code,
            input_data=req.custom_input,
            time_limit=2.0,
            memory_limit_mb=128
        )
        total_time = res.execution_time
        max_memory = res.memory_usage
        results.append({
            "test_case_id": "custom",
            "order_index": 0,
            "is_hidden": False,
            "verdict": res.verdict,
            "execution_time": res.execution_time,
            "memory_usage": res.memory_usage,
            "marks_awarded": 0.0,
            "input_data": req.custom_input,
            "actual_output": res.stdout,
            "error_message": res.stderr or res.compiler_output
        })
        if res.verdict == "Accepted":
            passed_cases = 1
        else:
            overall_verdict = res.verdict
    else:
        # Run against public test cases only
        public_tcs = [tc for tc in q.test_cases if not tc.is_hidden]
        if not public_tcs:
            # If no public test cases defined, run with sample_input
            res = LocalSandboxExecutor.execute(
                language=req.programming_language,
                source_code=req.source_code,
                input_data=q.sample_input,
                time_limit=2.0,
                memory_limit_mb=128
            )
            v, et, mem, marks, act_out, err = evaluate_test_case(
                language=req.programming_language,
                source_code=req.source_code,
                input_data=q.sample_input,
                expected_output=q.sample_output,
                time_limit=2.0,
                memory_limit_mb=128,
                marks=10.0
            )
            results.append({
                "test_case_id": "sample",
                "order_index": 0,
                "is_hidden": False,
                "verdict": v,
                "execution_time": et,
                "memory_usage": mem,
                "marks_awarded": marks,
                "input_data": q.sample_input,
                "expected_output": q.sample_output,
                "actual_output": act_out,
                "error_message": err
            })
            total_time = et
            max_memory = mem
            if v == "Accepted":
                passed_cases = 1
            else:
                overall_verdict = v
        else:
            for idx, tc in enumerate(public_tcs):
                v, et, mem, marks, act_out, err = evaluate_test_case(
                    language=req.programming_language,
                    source_code=req.source_code,
                    input_data=tc.input_data,
                    expected_output=tc.expected_output,
                    time_limit=tc.time_limit,
                    memory_limit_mb=tc.memory_limit,
                    marks=tc.marks
                )
                total_time += et
                if mem > max_memory:
                    max_memory = mem
                if v == "Accepted":
                    passed_cases += 1
                elif overall_verdict == "Accepted":
                    overall_verdict = v

                results.append({
                    "test_case_id": tc.id,
                    "order_index": idx,
                    "is_hidden": False,
                    "verdict": v,
                    "execution_time": et,
                    "memory_usage": mem,
                    "marks_awarded": marks,
                    "input_data": tc.input_data,
                    "expected_output": tc.expected_output,
                    "actual_output": act_out,
                    "error_message": err
                })

    return {
        "status": "Completed" if overall_verdict in ("Accepted", "Wrong Answer") else overall_verdict,
        "verdict": overall_verdict if results else "No Test Cases",
        "total_test_cases": len(results),
        "passed_test_cases": passed_cases,
        "execution_time": round(total_time, 4),
        "memory_usage": round(max_memory, 2),
        "results": results
    }

@router.post("/submit", response_model=SubmissionResponse)
def submit_code(
    req: CodeSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits code for authoritative evaluation against all test cases (public and hidden).
    Calculates marks, runs AI code quality analysis, stores persistent submission record.
    """
    q = db.query(Question).filter(Question.id == req.question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    # Assessment validation if specified
    if req.assessment_id:
        assm = db.query(Assessment).filter(Assessment.id == req.assessment_id).first()
        if not assm:
            raise HTTPException(status_code=404, detail="Assessment not found")
        # Check active session
        session = db.query(AssessmentSession).filter(
            AssessmentSession.assessment_id == req.assessment_id,
            AssessmentSession.student_id == current_user.id
        ).first()
        if session and session.is_submitted:
            raise HTTPException(status_code=400, detail="Assessment has already been submitted.")

    test_cases = q.test_cases
    if not test_cases:
        # Fallback to single sample test case if none seeded
        test_cases = [QuestionTestCase(
            id="default",
            question_id=q.id,
            input_data=q.sample_input,
            expected_output=q.sample_output,
            marks=q.max_marks,
            is_hidden=False,
            time_limit=2.0,
            memory_limit=128
        )]

    total_marks_awarded = 0.0
    passed_cases = 0
    total_time = 0.0
    max_memory = 0.0
    final_verdict = "Accepted"
    comp_output = ""

    db_submission = Submission(
        student_id=current_user.id,
        assessment_id=req.assessment_id,
        question_id=q.id,
        source_code=req.source_code,
        programming_language=req.programming_language,
        verdict="Evaluating",
        submitted_at=datetime.now(timezone.utc)
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)

    test_results_to_add = []
    for tc in test_cases:
        v, et, mem, marks, act_out, err = evaluate_test_case(
            language=req.programming_language,
            source_code=req.source_code,
            input_data=tc.input_data,
            expected_output=tc.expected_output,
            time_limit=tc.time_limit,
            memory_limit_mb=tc.memory_limit,
            marks=tc.marks
        )
        total_time += et
        if mem > max_memory:
            max_memory = mem

        if v == "Accepted":
            passed_cases += 1
            total_marks_awarded += marks
        else:
            if final_verdict == "Accepted":
                final_verdict = v
            if v == "Compilation Error" and err:
                comp_output = err

        str_res = SubmissionTestResult(
            submission_id=db_submission.id,
            test_case_id=tc.id if tc.id != "default" else None,
            verdict=v,
            execution_time=et,
            memory_usage=mem,
            marks_awarded=marks if v == "Accepted" else 0.0,
            actual_output=act_out if not tc.is_hidden else "[Hidden]",
            error_message=err if not tc.is_hidden else (err if v != "Wrong Answer" else None),
            is_hidden=tc.is_hidden
        )
        test_results_to_add.append(str_res)

    for tr in test_results_to_add:
        if tr.test_case_id:
            db.add(tr)

    # Scale score to question max_marks
    total_tc_marks = sum(tc.marks for tc in test_cases)
    if total_tc_marks > 0:
        scaled_score = (total_marks_awarded / total_tc_marks) * q.max_marks
    else:
        scaled_score = q.max_marks if final_verdict == "Accepted" else 0.0

    db_submission.verdict = final_verdict
    db_submission.score = round(scaled_score, 2)
    db_submission.passed_test_cases = passed_cases
    db_submission.total_test_cases = len(test_cases)
    db_submission.execution_time = round(total_time, 4)
    db_submission.memory_usage = round(max_memory, 2)
    db_submission.compiler_output = comp_output

    # Run AI Code Quality Analysis
    ai_quality = CodeQualityAnalyzer.analyze(req.source_code, req.programming_language)
    quality_report = CodeQualityReport(
        submission_id=db_submission.id,
        quality_score=ai_quality["quality_score"],
        cyclomatic_complexity=ai_quality["cyclomatic_complexity"],
        maintainability_index=ai_quality["maintainability_index"],
        readability_score=ai_quality["readability_score"],
        detected_issues=ai_quality["detected_issues"],
        improvement_suggestions=ai_quality["improvement_suggestions"],
        explanation=ai_quality["explanation"],
        estimated_time_complexity=ai_quality["estimated_time_complexity"],
        estimated_space_complexity=ai_quality["estimated_space_complexity"]
    )
    db.add(quality_report)

    # Update Student Performance
    perf = db.query(StudentPerformance).filter(StudentPerformance.student_id == current_user.id).first()
    if not perf:
        perf = StudentPerformance(
            student_id=current_user.id,
            total_submissions=1,
            problems_solved=1 if final_verdict == "Accepted" else 0,
            acceptance_rate=100.0 if final_verdict == "Accepted" else 0.0,
            average_score=db_submission.score,
            highest_score=db_submission.score,
            lowest_score=db_submission.score,
            topic_stats={q.topic: {"attempted": 1, "solved": 1 if final_verdict == "Accepted" else 0}},
            language_usage={req.programming_language: 1}
        )
        db.add(perf)
    else:
        perf.total_submissions += 1
        if final_verdict == "Accepted":
            perf.problems_solved += 1
        perf.acceptance_rate = round((perf.problems_solved / perf.total_submissions) * 100, 1)
        if db_submission.score > perf.highest_score:
            perf.highest_score = db_submission.score
        if perf.lowest_score == 0.0 or db_submission.score < perf.lowest_score:
            perf.lowest_score = db_submission.score
        
        # Topic stats
        t_stats = perf.topic_stats or {}
        cur_t = t_stats.get(q.topic, {"attempted": 0, "solved": 0})
        cur_t["attempted"] += 1
        if final_verdict == "Accepted":
            cur_t["solved"] += 1
        t_stats[q.topic] = cur_t
        perf.topic_stats = dict(t_stats)

        # Language usage
        lang_usage = perf.language_usage or {}
        lang_usage[req.programming_language] = lang_usage.get(req.programming_language, 0) + 1
        perf.language_usage = dict(lang_usage)

    # Log activity
    log = ActivityLog(
        user_id=current_user.id,
        action="SUBMIT_CODE",
        entity_type="Submission",
        entity_id=db_submission.id,
        details={"question_id": q.id, "verdict": final_verdict, "score": db_submission.score}
    )
    db.add(log)
    db.commit()
    db.refresh(db_submission)

    return db_submission
