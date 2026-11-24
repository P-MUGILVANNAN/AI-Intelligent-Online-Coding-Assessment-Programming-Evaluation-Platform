import os
import sys
import pytest
import httpx

backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.main import app
from app.execution.runner import LocalSandboxExecutor
from app.ai.quality import CodeQualityAnalyzer
from app.ai.plagiarism import HybridPlagiarismDetector

@pytest.fixture
def anyio_backend():
    return 'asyncio'

@pytest.mark.anyio
async def test_health_check():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "CodeEval AI" in data["service"]

@pytest.mark.anyio
async def test_login_demo_accounts():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as ac:
        # Admin login
        res_admin = await ac.post("/api/auth/login", json={"email": "admin@codeeval.ai", "password": "Admin@123"})
        assert res_admin.status_code == 200
        assert "access_token" in res_admin.json()
        assert res_admin.json()["user"]["role"] == "Administrator"

        # Instructor login
        res_inst = await ac.post("/api/auth/login", json={"email": "instructor@codeeval.ai", "password": "Instructor@123"})
        assert res_inst.status_code == 200
        assert res_inst.json()["user"]["role"] == "Instructor"

        # Student login
        res_stud = await ac.post("/api/auth/login", json={"email": "student@codeeval.ai", "password": "Student@123"})
        assert res_stud.status_code == 200
        assert res_stud.json()["user"]["role"] == "Student"

@pytest.mark.anyio
async def test_invalid_login():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/auth/login", json={"email": "student@codeeval.ai", "password": "WrongPassword"})
        assert res.status_code == 401

@pytest.mark.anyio
async def test_rbac_user_management():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as ac:
        # Student cannot access /api/users
        res_stud = await ac.post("/api/auth/login", json={"email": "student@codeeval.ai", "password": "Student@123"})
        student_token = res_stud.json()["access_token"]
        
        headers_stud = {"Authorization": f"Bearer {student_token}"}
        res_forbidden = await ac.get("/api/users", headers=headers_stud)
        assert res_forbidden.status_code == 403

        # Admin CAN access /api/users
        res_admin = await ac.post("/api/auth/login", json={"email": "admin@codeeval.ai", "password": "Admin@123"})
        admin_token = res_admin.json()["access_token"]
        headers_admin = {"Authorization": f"Bearer {admin_token}"}
        res_allowed = await ac.get("/api/users", headers=headers_admin)
        assert res_allowed.status_code == 200
        assert len(res_allowed.json()) >= 3

@pytest.mark.anyio
async def test_hidden_test_cases_masked_for_student():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as ac:
        res_stud = await ac.post("/api/auth/login", json={"email": "student@codeeval.ai", "password": "Student@123"})
        headers_stud = {"Authorization": f"Bearer {res_stud.json()['access_token']}"}

        res_qs = await ac.get("/api/questions", headers=headers_stud)
        assert res_qs.status_code == 200
        questions = res_qs.json()
        assert len(questions) >= 20

        # Verify hidden test case inputs are masked for student
        first_q = questions[0]
        hidden_tcs = [tc for tc in first_q["test_cases"] if tc["is_hidden"]]
        for tc in hidden_tcs:
            assert tc["input_data"] == "[Hidden Test Case]"
            assert tc["expected_output"] == "[Hidden Output]"

def test_code_sandbox_execution():
    # Valid Python Code
    py_code = "print(sum(map(int, input().split())))"
    res = LocalSandboxExecutor.execute("python", py_code, input_data="10 20 30")
    assert res.verdict == "Accepted"
    assert res.stdout.strip() == "60"
    assert res.execution_time > 0.0

    # Syntax Error Python Code
    bad_py = "def broken(:\n  print(1)"
    res_err = LocalSandboxExecutor.execute("python", bad_py)
    assert res_err.verdict == "Compilation Error"

    # Security check: blocked module
    malicious_py = "import socket\ns = socket.socket()"
    res_sec = LocalSandboxExecutor.execute("python", malicious_py)
    assert res_sec.verdict == "Runtime Error"
    assert "Security Restriction" in res_sec.stderr

def test_ai_code_quality_analyzer():
    sample_code = """
def find_max(numbers):
    # Returns the largest number in array
    max_val = numbers[0]
    for n in numbers:
        if n > max_val:
            max_val = n
    return max_val
"""
    quality = CodeQualityAnalyzer.analyze(sample_code, "python")
    assert quality["quality_score"] > 70.0
    assert quality["cyclomatic_complexity"] >= 2
    assert "O(N)" in quality["estimated_time_complexity"]
    assert len(quality["improvement_suggestions"]) > 0

def test_hybrid_plagiarism_detector():
    code_1 = """
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        comp = target - num
        if comp in seen:
            return [seen[comp], i]
        seen[num] = i
    return []
"""
    code_2 = """
def find_two_sum(elements, goal):
    lookup = {}
    for idx, item in enumerate(elements):
        difference = goal - item
        if difference in lookup:
            return [lookup[difference], idx]
        lookup[item] = idx
    return []
"""
    unrelated_code = """
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
"""
    sim_high = HybridPlagiarismDetector.compare_submissions(code_1, code_2, "python")
    assert sim_high["similarity_score"] >= 75.0
    assert sim_high["token_similarity"] > 70.0

    sim_low = HybridPlagiarismDetector.compare_submissions(code_1, unrelated_code, "python")
    assert sim_low["similarity_score"] < 40.0
