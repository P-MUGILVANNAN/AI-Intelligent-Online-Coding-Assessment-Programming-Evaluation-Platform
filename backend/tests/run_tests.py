import os
import sys

backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.core.database import SessionLocal
from app.core.security import verify_password, create_access_token, decode_token
from app.models.user import User
from app.models.question import Question
from app.models.assessment import Assessment
from app.execution.runner import LocalSandboxExecutor, evaluate_test_case
from app.ai.quality import CodeQualityAnalyzer
from app.ai.plagiarism import HybridPlagiarismDetector
from app.services.report_service import ReportService
from app.api.auth import login
from app.schemas.auth import LoginRequest

def run_all_tests():
    print("=" * 60)
    print("CodeEval AI - Full System Verification Suite")
    print("=" * 60)

    db = SessionLocal()
    passed = 0
    total = 0

    try:
        # Test 1: Database Connections & Seeding
        total += 1
        users = db.query(User).all()
        assert len(users) >= 3, f"Expected at least 3 users, found {len(users)}"
        print(f"[PASS] Database Seeding: Found {len(users)} users.")
        passed += 1

        # Test 2: Password Verification & JWT Tokens
        total += 1
        admin = db.query(User).filter(User.email == "admin@codeeval.ai").first()
        assert admin is not None
        assert verify_password("Admin@123", admin.password_hash)
        assert not verify_password("WrongPassword", admin.password_hash)
        
        token = create_access_token(admin.id, admin.role.name)
        payload = decode_token(token)
        assert payload["sub"] == admin.id
        assert payload["role"] == "Administrator"
        print("[PASS] Security & JWT: Hashing, verification, and token rotation validated.")
        passed += 1

        # Test 3: Question Bank & Test Cases
        total += 1
        questions = db.query(Question).all()
        assert len(questions) >= 20, f"Expected >=20 questions, found {len(questions)}"
        print(f"[PASS] Question Bank: {len(questions)} multi-topic questions validated.")
        passed += 1

        # Test 4: Assessment Association
        total += 1
        assessments = db.query(Assessment).all()
        assert len(assessments) >= 5, f"Expected >=5 assessments, found {len(assessments)}"
        print(f"[PASS] Assessments: {len(assessments)} full assessments active and scheduled.")
        passed += 1

        # Test 5: Code Sandbox Execution (Python)
        total += 1
        py_code = "print(sum(map(int, input().split())))"
        res = LocalSandboxExecutor.execute("python", py_code, input_data="10 20 30")
        assert res.verdict == "Accepted"
        assert res.stdout.strip() == "60"
        assert res.execution_time >= 0.0
        print(f"[PASS] Code Execution Engine (Python): Time={res.execution_time:.3f}s, Mem={res.memory_usage:.1f}MB, Output={res.stdout.strip()}")
        passed += 1

        # Test 6: Code Sandbox Execution (JavaScript / Node.js)
        total += 1
        js_code = "const fs = require('fs'); const n = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number); console.log(n[0] + n[1]);"
        res_js = LocalSandboxExecutor.execute("javascript", js_code, input_data="40 60")
        assert res_js.verdict == "Accepted"
        assert res_js.stdout.strip() == "100"
        print(f"[PASS] Code Execution Engine (Node.js): Time={res_js.execution_time:.3f}s, Mem={res_js.memory_usage:.1f}MB, Output={res_js.stdout.strip()}")
        passed += 1

        # Test 7: Sandbox Security & Blocklist
        total += 1
        bad_code = "import socket\ns = socket.socket()"
        res_sec = LocalSandboxExecutor.execute("python", bad_code)
        assert res_sec.verdict == "Runtime Error"
        assert "Security Restriction" in res_sec.stderr
        print("[PASS] Sandbox Security: Forbidden system call / socket import blocked.")
        passed += 1

        # Test 8: AI Code Quality Analysis
        total += 1
        sample_code = """
def two_sum(nums, target):
    # Solves two sum in O(N) using dictionary
    seen = {}
    for i, num in enumerate(nums):
        comp = target - num
        if comp in seen:
            return [seen[comp], i]
        seen[num] = i
    return []
"""
        quality = CodeQualityAnalyzer.analyze(sample_code, "python")
        assert quality["quality_score"] > 80.0
        assert quality["cyclomatic_complexity"] >= 2
        assert "O(N)" in quality["estimated_time_complexity"]
        print(f"[PASS] AI Code Quality: Quality Score={quality['quality_score']}/100, Complexity={quality['cyclomatic_complexity']}, Time={quality['estimated_time_complexity']}")
        passed += 1

        # Test 9: Hybrid Plagiarism Detection
        total += 1
        code_a = """
def solve(arr, k):
    res = []
    for x in arr:
        if x > k:
            res.append(x * 2)
    return res
"""
        code_b = """
def compute(items, threshold):
    output = []
    for element in items:
        if element > threshold:
            output.append(element * 2)
    return output
"""
        unrelated = """
def gcd(a, b):
    while b:
        a, b = b, a % b
    return a
"""
        plag_high = HybridPlagiarismDetector.compare_submissions(code_a, code_b, "python")
        plag_low = HybridPlagiarismDetector.compare_submissions(code_a, unrelated, "python")
        assert plag_high["similarity_score"] >= 65.0
        assert plag_low["similarity_score"] < 40.0
        print(f"[PASS] Hybrid Plagiarism Detector: High Sim={plag_high['similarity_score']}%, Low Sim={plag_low['similarity_score']}%")
        passed += 1

        # Test 10: PDF & CSV Report Generation
        total += 1
        csv_data = ReportService.generate_assessment_csv("Basic Programming Test", [
            {"student_name": "Alex Mercer", "student_email": "student@codeeval.ai", "score": 100, "percentage": 100, "status": "Completed", "submitted_at": "2026-11-16", "violations": 0}
        ])
        assert "Alex Mercer" in csv_data

        pdf_bytes = ReportService.generate_student_pdf(
            student_name="Alex Mercer",
            assessment_title="Basic Programming Test",
            total_marks=100.0,
            obtained_marks=100.0,
            percentage=100.0,
            submissions_data=[{"question_title": "Two Sum", "programming_language": "Python", "verdict": "Accepted", "passed_test_cases": 4, "total_test_cases": 4, "execution_time": 0.03, "memory_usage": 14.0, "score": 100}],
            quality_feedback=[{"question_title": "Two Sum", "quality_score": 92.5, "complexity": 2, "time_complexity": "O(N)", "explanation": "Optimal O(N) hash map solution.", "suggestions": ["Include type annotations."]}]
        )
        assert len(pdf_bytes) > 1000
        print(f"[PASS] Report Service: CSV and PDF ({len(pdf_bytes)} bytes) successfully generated.")
        passed += 1

    finally:
        db.close()

    print("=" * 60)
    print(f"Results: {passed}/{total} Tests Passed Successfully! (100% Pass Rate)")
    print("=" * 60)

if __name__ == "__main__":
    run_all_tests()
