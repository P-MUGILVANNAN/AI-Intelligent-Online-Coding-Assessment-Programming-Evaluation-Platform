import ast
import re
import math
from typing import Dict, Any, List

class CodeQualityAnalyzer:
    """
    Performs static AST analysis, complexity calculation,
    and rule-based heuristic checks for submitted source code.
    """

    @classmethod
    def analyze(cls, code: str, language: str = "python") -> Dict[str, Any]:
        language = language.lower()
        if language in ("python", "python3"):
            return cls._analyze_python(code)
        else:
            return cls._analyze_generic(code, language)

    @classmethod
    def _analyze_python(cls, code: str) -> Dict[str, Any]:
        detected_issues = []
        suggestions = []
        complexity = 1
        lines = code.splitlines()
        loc = len([l for l in lines if l.strip() and not l.strip().startswith("#")])
        
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            return {
                "quality_score": 40.0,
                "cyclomatic_complexity": 1,
                "maintainability_index": 50.0,
                "readability_score": 45.0,
                "detected_issues": [{"type": "error", "line": e.lineno, "message": f"Syntax error: {e.msg}"}],
                "improvement_suggestions": ["Resolve syntax errors before running static analysis."],
                "explanation": "Code contains syntax errors preventing full AST analysis.",
                "estimated_time_complexity": "Indeterminate",
                "estimated_space_complexity": "Indeterminate"
            }

        # Analyze AST
        max_loop_depth = 0
        current_loop_depth = 0
        has_functions = False
        var_names = []
        has_docstrings = False
        single_letter_vars = 0

        class ComplexityVisitor(ast.NodeVisitor):
            nonlocal complexity, max_loop_depth, current_loop_depth, has_functions, has_docstrings, single_letter_vars

            def visit_FunctionDef(self, node):
                nonlocal has_functions, has_docstrings
                has_functions = True
                if ast.get_docstring(node):
                    has_docstrings = True
                self.generic_visit(node)

            def visit_If(self, node):
                nonlocal complexity
                complexity += 1
                self.generic_visit(node)

            def visit_For(self, node):
                nonlocal complexity, current_loop_depth, max_loop_depth
                complexity += 1
                current_loop_depth += 1
                if current_loop_depth > max_loop_depth:
                    max_loop_depth = current_loop_depth
                self.generic_visit(node)
                current_loop_depth -= 1

            def visit_While(self, node):
                nonlocal complexity, current_loop_depth, max_loop_depth
                complexity += 1
                current_loop_depth += 1
                if current_loop_depth > max_loop_depth:
                    max_loop_depth = current_loop_depth
                self.generic_visit(node)
                current_loop_depth -= 1

            def visit_Name(self, node):
                nonlocal single_letter_vars
                if isinstance(node.ctx, ast.Store):
                    var_names.append(node.id)
                    if len(node.id) == 1 and node.id not in ("i", "j", "k", "n", "_"):
                        single_letter_vars += 1
                self.generic_visit(node)

        visitor = ComplexityVisitor()
        visitor.visit(tree)

        # Issues & suggestions
        if max_loop_depth >= 3:
            detected_issues.append({
                "type": "warning",
                "message": f"Detected deeply nested loops (depth {max_loop_depth}). May lead to O(N^{max_loop_depth}) polynomial time complexity."
            })
            suggestions.append("Consider reducing nested loops using Hash Maps, Binary Search, or dynamic programming.")
        elif max_loop_depth == 2:
            detected_issues.append({
                "type": "info",
                "message": "Nested loops detected. Ensure quadratic O(N^2) complexity complies with input constraints (N <= 10^4)."
            })
            suggestions.append("Evaluate whether two-pointer or sorting techniques could lower the quadratic bound.")

        if not has_functions and loc > 25:
            detected_issues.append({
                "type": "warning",
                "message": f"Solution is written as a single monolithic block ({loc} lines) without modular function definitions."
            })
            suggestions.append("Refactor the algorithm into dedicated helper functions to enhance maintainability.")

        if single_letter_vars > 2:
            detected_issues.append({
                "type": "info",
                "message": f"Identified {single_letter_vars} single-character variable names."
            })
            suggestions.append("Use descriptive variable names (e.g., 'max_sum', 'current_node') to improve self-documentation.")

        # Estimate Complexity
        if max_loop_depth == 0:
            est_time = "O(1) or O(log N)"
        elif max_loop_depth == 1:
            est_time = "O(N)"
        elif max_loop_depth == 2:
            est_time = "O(N^2)"
        elif max_loop_depth == 3:
            est_time = "O(N^3)"
        else:
            est_time = f"O(N^{max_loop_depth})"

        est_space = "O(N)" if ("append" in code or "list" in code or "set" in code or "dict" in code) else "O(1)"

        # Calculate Scores
        # Cyclomatic complexity baseline: 1-5 is good, >10 is complex
        complexity_penalty = min(30, max(0, (complexity - 3) * 4))
        nesting_penalty = max(0, (max_loop_depth - 1) * 8)
        naming_penalty = min(15, single_letter_vars * 3)
        modular_bonus = 10 if has_functions else 0

        quality_score = max(40.0, min(98.0, 100 - complexity_penalty - nesting_penalty - naming_penalty + modular_bonus))
        
        # Maintainability Index calculation (Halstead approximation)
        volume = max(1.0, loc * math.log2(max(2, len(set(var_names)) + 5)))
        mi = max(20.0, min(100.0, 171 - 5.2 * math.log(volume) - 0.23 * complexity - 16.2 * math.log(max(1, loc))))
        
        readability = max(50.0, min(95.0, 90.0 - naming_penalty - (0 if has_functions else 10)))

        if not suggestions:
            suggestions.append("Code demonstrates clean algorithmic structure and sound naming conventions.")

        explanation = (
            f"Static AST inspection identified cyclomatic complexity of {complexity} with a maximum loop nesting depth of {max_loop_depth}. "
            f"Estimated algorithmic time complexity is approximately {est_time} with auxiliary space {est_space}. "
            f"Maintainability index rated at {round(mi, 1)}/100."
        )

        return {
            "quality_score": round(quality_score, 1),
            "cyclomatic_complexity": complexity,
            "maintainability_index": round(mi, 1),
            "readability_score": round(readability, 1),
            "detected_issues": detected_issues,
            "improvement_suggestions": suggestions,
            "explanation": explanation,
            "estimated_time_complexity": est_time,
            "estimated_space_complexity": est_space
        }

    @classmethod
    def _analyze_generic(cls, code: str, language: str) -> Dict[str, Any]:
        lines = code.splitlines()
        loc = len([l for l in lines if l.strip()])
        loops = len(re.findall(r"\b(for|while)\b", code))
        ifs = len(re.findall(r"\b(if|else if|switch|case)\b", code))
        complexity = max(1, loops + ifs)
        
        detected_issues = []
        suggestions = []

        if loops > 2:
            detected_issues.append({
                "type": "info",
                "message": f"Contains {loops} loop constructs. Verify that time complexity fits problem constraints."
            })
            suggestions.append("Ensure optimal algorithmic bounds by caching intermediate states.")
        
        quality_score = max(50.0, min(95.0, 95.0 - min(30, (complexity - 2) * 5)))
        readability = 82.0
        mi = max(40.0, min(92.0, 95.0 - (loc * 0.3) - (complexity * 2)))

        suggestions.append(f"Follow standard {language.capitalize()} style conventions and modularize key functions.")

        return {
            "quality_score": round(quality_score, 1),
            "cyclomatic_complexity": complexity,
            "maintainability_index": round(mi, 1),
            "readability_score": round(readability, 1),
            "detected_issues": detected_issues,
            "improvement_suggestions": suggestions,
            "explanation": f"Source code analysis for {language.capitalize()}: cyclomatic complexity is {complexity} across {loc} lines of code.",
            "estimated_time_complexity": "O(N)" if loops <= 1 else "O(N^2)",
            "estimated_space_complexity": "O(1)"
        }
