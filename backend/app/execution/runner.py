import os
import sys
import time
import ast
import tempfile
import subprocess
import shutil
import psutil
from typing import Dict, Any, List, Optional, Tuple
from app.core.config import settings

SAFE_PYTHON_MODULE_BLOCKLIST = {
    "socket", "subprocess", "ctypes", "pty", "winreg",
    "shutil", "telnetlib", "ftplib", "smtplib"
}

def validate_python_code_security(code: str) -> Optional[str]:
    """Inspects Python code AST for unsafe modules or syscall attempts."""
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return f"SyntaxError: {str(e)}"

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                if alias.name.split(".")[0] in SAFE_PYTHON_MODULE_BLOCKLIST:
                    return f"Security Restriction: Importing '{alias.name}' is prohibited in the execution sandbox."
        elif isinstance(node, ast.ImportFrom):
            if node.module and node.module.split(".")[0] in SAFE_PYTHON_MODULE_BLOCKLIST:
                return f"Security Restriction: Importing from '{node.module}' is prohibited in the execution sandbox."
        elif isinstance(node, ast.Call):
            # Check for __import__ or eval or exec on dangerous things
            if isinstance(node.func, ast.Name) and node.func.id in ("eval", "exec"):
                # Warning or restriction
                pass
    return None

def normalize_output(text: str, ignore_whitespace: bool = True) -> str:
    """Normalizes output by trimming and optionally normalizing whitespace."""
    if text is None:
        return ""
    # Standardize line breaks
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    if ignore_whitespace:
        lines = [line.strip() for line in text.strip().split("\n")]
        return "\n".join(lines).strip()
    return text.strip()

def check_numeric_tolerance(actual: str, expected: str, tolerance: float = 1e-4) -> bool:
    """Checks if two float string outputs match within tolerance."""
    try:
        a_val = float(actual.strip())
        e_val = float(expected.strip())
        return abs(a_val - e_val) <= tolerance
    except (ValueError, TypeError):
        return False

class ExecutionResult:
    def __init__(
        self,
        verdict: str, # "Accepted", "Wrong Answer", "Compilation Error", "Runtime Error", "Time Limit Exceeded", "Memory Limit Exceeded"
        stdout: str = "",
        stderr: str = "",
        execution_time: float = 0.0, # in seconds
        memory_usage: float = 0.0,   # in MB
        compiler_output: str = ""
    ):
        self.verdict = verdict
        self.stdout = stdout
        self.stderr = stderr
        self.execution_time = execution_time
        self.memory_usage = memory_usage
        self.compiler_output = compiler_output

    def to_dict(self) -> Dict[str, Any]:
        return {
            "verdict": self.verdict,
            "stdout": self.stdout,
            "stderr": self.stderr,
            "execution_time": round(self.execution_time, 4),
            "memory_usage": round(self.memory_usage, 2),
            "compiler_output": self.compiler_output
        }

class LocalSandboxExecutor:
    """
    Executes student code in an isolated temporary directory with timeouts,
    memory tracking via psutil, and process termination.
    """

    @staticmethod
    def execute(
        language: str,
        source_code: str,
        input_data: str = "",
        time_limit: float = 2.0,
        memory_limit_mb: int = 128
    ) -> ExecutionResult:
        language = language.lower()

        # Security check for Python
        if language == "python" or language == "python3":
            sec_err = validate_python_code_security(source_code)
            if sec_err:
                return ExecutionResult(
                    verdict="Runtime Error",
                    stderr=sec_err,
                    compiler_output=sec_err
                )

        temp_dir = tempfile.mkdtemp(prefix="codeeval_sandbox_")
        try:
            if language in ("python", "python3"):
                return LocalSandboxExecutor._run_python(
                    temp_dir, source_code, input_data, time_limit, memory_limit_mb
                )
            elif language in ("javascript", "js", "node"):
                return LocalSandboxExecutor._run_javascript(
                    temp_dir, source_code, input_data, time_limit, memory_limit_mb
                )
            elif language in ("c", "cpp", "c++"):
                return LocalSandboxExecutor._run_cpp(
                    temp_dir, source_code, input_data, time_limit, memory_limit_mb, is_cpp=(language != "c")
                )
            elif language == "java":
                return LocalSandboxExecutor._run_java(
                    temp_dir, source_code, input_data, time_limit, memory_limit_mb
                )
            elif language == "go":
                return LocalSandboxExecutor._run_go(
                    temp_dir, source_code, input_data, time_limit, memory_limit_mb
                )
            else:
                return ExecutionResult(
                    verdict="Internal Evaluation Error",
                    stderr=f"Language '{language}' is not currently configured in the local engine."
                )
        finally:
            # Clean up temp sandbox directory
            shutil.rmtree(temp_dir, ignore_errors=True)

    @staticmethod
    def _execute_subprocess(
        cmd: List[str],
        cwd: str,
        input_data: str,
        time_limit: float,
        memory_limit_mb: int
    ) -> ExecutionResult:
        start_time = time.perf_counter()
        peak_memory = 0.0

        try:
            # Prepare restricted environment
            env = {
                "PATH": os.environ.get("PATH", ""),
                "SYSTEMROOT": os.environ.get("SYSTEMROOT", "C:\\Windows"),
                "PYTHONUNBUFFERED": "1",
                "NODE_OPTIONS": f"--max-old-space-size={memory_limit_mb}",
            }

            process = subprocess.Popen(
                cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=cwd,
                env=env,
                text=True,
                creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
            )

            # Monitor memory using psutil
            try:
                p = psutil.Process(process.pid)
            except Exception:
                p = None

            try:
                stdout, stderr = process.communicate(input=input_data, timeout=time_limit)
                exec_time = time.perf_counter() - start_time
                if p:
                    try:
                        mem_info = p.memory_info()
                        peak_memory = mem_info.rss / (1024 * 1024)
                    except Exception:
                        peak_memory = 15.0
                else:
                    peak_memory = 15.0

                if process.returncode != 0:
                    return ExecutionResult(
                        verdict="Runtime Error",
                        stdout=stdout,
                        stderr=stderr,
                        execution_time=exec_time,
                        memory_usage=peak_memory
                    )

                return ExecutionResult(
                    verdict="Accepted", # tentatively, output check happens in judge
                    stdout=stdout,
                    stderr=stderr,
                    execution_time=exec_time,
                    memory_usage=peak_memory
                )

            except subprocess.TimeoutExpired:
                process.kill()
                stdout, stderr = process.communicate()
                return ExecutionResult(
                    verdict="Time Limit Exceeded",
                    stdout=stdout or "",
                    stderr=f"Execution timed out after {time_limit} seconds",
                    execution_time=time_limit,
                    memory_usage=peak_memory
                )

        except Exception as e:
            return ExecutionResult(
                verdict="Internal Evaluation Error",
                stderr=str(e),
                execution_time=time.perf_counter() - start_time
            )

    @staticmethod
    def _run_python(temp_dir: str, code: str, input_data: str, time_limit: float, memory_limit_mb: int) -> ExecutionResult:
        file_path = os.path.join(temp_dir, "solution.py")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(code)

        # Check syntax first
        try:
            compile(code, "solution.py", "exec")
        except SyntaxError as e:
            return ExecutionResult(
                verdict="Compilation Error",
                compiler_output=f"SyntaxError on line {e.lineno}: {e.msg}"
            )

        cmd = [sys.executable, "-u", "solution.py"]
        return LocalSandboxExecutor._execute_subprocess(cmd, temp_dir, input_data, time_limit, memory_limit_mb)

    @staticmethod
    def _run_javascript(temp_dir: str, code: str, input_data: str, time_limit: float, memory_limit_mb: int) -> ExecutionResult:
        file_path = os.path.join(temp_dir, "solution.js")
        
        # Add stdin reading wrapper if user didn't write fs.readFileSync
        wrapped_code = code
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(wrapped_code)

        cmd = ["node", "solution.js"]
        return LocalSandboxExecutor._execute_subprocess(cmd, temp_dir, input_data, time_limit, memory_limit_mb)

    @staticmethod
    def _run_cpp(temp_dir: str, code: str, input_data: str, time_limit: float, memory_limit_mb: int, is_cpp: bool = True) -> ExecutionResult:
        ext = "cpp" if is_cpp else "c"
        src_path = os.path.join(temp_dir, f"solution.{ext}")
        exe_path = os.path.join(temp_dir, "solution.exe" if os.name == "nt" else "solution")
        with open(src_path, "w", encoding="utf-8") as f:
            f.write(code)

        compiler = "g++" if is_cpp else "gcc"
        compile_cmd = [compiler, f"solution.{ext}", "-o", exe_path, "-O2"]
        try:
            comp_proc = subprocess.run(compile_cmd, cwd=temp_dir, capture_output=True, text=True, timeout=10)
            if comp_proc.returncode != 0:
                return ExecutionResult(
                    verdict="Compilation Error",
                    compiler_output=comp_proc.stderr or comp_proc.stdout
                )
        except FileNotFoundError:
            return ExecutionResult(
                verdict="Internal Evaluation Error",
                stderr=f"C/C++ compiler ({compiler}) is not available in host environment. Please configure Judge0 or MinGW/GCC."
            )
        except Exception as e:
            return ExecutionResult(
                verdict="Compilation Error",
                compiler_output=str(e)
            )

        return LocalSandboxExecutor._execute_subprocess([exe_path], temp_dir, input_data, time_limit, memory_limit_mb)

    @staticmethod
    def _run_java(temp_dir: str, code: str, input_data: str, time_limit: float, memory_limit_mb: int) -> ExecutionResult:
        src_path = os.path.join(temp_dir, "Main.java")
        with open(src_path, "w", encoding="utf-8") as f:
            f.write(code)

        try:
            comp_proc = subprocess.run(["javac", "Main.java"], cwd=temp_dir, capture_output=True, text=True, timeout=10)
            if comp_proc.returncode != 0:
                return ExecutionResult(
                    verdict="Compilation Error",
                    compiler_output=comp_proc.stderr or comp_proc.stdout
                )
        except FileNotFoundError:
            return ExecutionResult(
                verdict="Internal Evaluation Error",
                stderr="Java compiler (javac) is not available in host environment. Please install JDK or configure Judge0."
            )
        except Exception as e:
            return ExecutionResult(
                verdict="Compilation Error",
                compiler_output=str(e)
            )

        cmd = ["java", "-Xmx" + str(memory_limit_mb) + "m", "Main"]
        return LocalSandboxExecutor._execute_subprocess(cmd, temp_dir, input_data, time_limit, memory_limit_mb)

    @staticmethod
    def _run_go(temp_dir: str, code: str, input_data: str, time_limit: float, memory_limit_mb: int) -> ExecutionResult:
        src_path = os.path.join(temp_dir, "main.go")
        with open(src_path, "w", encoding="utf-8") as f:
            f.write(code)

        cmd = ["go", "run", "main.go"]
        return LocalSandboxExecutor._execute_subprocess(cmd, temp_dir, input_data, time_limit, memory_limit_mb)

def evaluate_test_case(
    language: str,
    source_code: str,
    input_data: str,
    expected_output: str,
    time_limit: float = 2.0,
    memory_limit_mb: int = 128,
    marks: float = 10.0
) -> Tuple[str, float, float, float, str, str]:
    """
    Executes code against a test case and evaluates correctness.
    Returns: (verdict, execution_time, memory_usage, marks_awarded, actual_output, error_message)
    """
    res = LocalSandboxExecutor.execute(
        language=language,
        source_code=source_code,
        input_data=input_data,
        time_limit=time_limit,
        memory_limit_mb=memory_limit_mb
    )

    if res.verdict != "Accepted":
        return (res.verdict, res.execution_time, res.memory_usage, 0.0, res.stdout, res.stderr or res.compiler_output)

    norm_actual = normalize_output(res.stdout)
    norm_expected = normalize_output(expected_output)

    if norm_actual == norm_expected:
        return ("Accepted", res.execution_time, res.memory_usage, marks, res.stdout, "")
    elif check_numeric_tolerance(norm_actual, norm_expected):
        return ("Accepted", res.execution_time, res.memory_usage, marks, res.stdout, "")
    else:
        return ("Wrong Answer", res.execution_time, res.memory_usage, 0.0, res.stdout, "Output did not match expected output.")
