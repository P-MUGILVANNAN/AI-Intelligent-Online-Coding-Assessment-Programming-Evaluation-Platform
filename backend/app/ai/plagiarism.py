import ast
import re
import tokenize
import io
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def tokenize_code(code: str, language: str = "python") -> List[str]:
    """Tokenizes code, stripping comments and normalizing identifiers."""
    if language.lower() in ("python", "python3"):
        tokens = []
        try:
            tok_gen = tokenize.generate_tokens(io.StringIO(code).readline)
            for tok_type, tok_val, _, _, _ in tok_gen:
                if tok_type == tokenize.COMMENT or tok_type == tokenize.NL or tok_type == tokenize.NEWLINE:
                    continue
                elif tok_type == tokenize.NAME:
                    tokens.append("VAR")
                elif tok_type == tokenize.NUMBER:
                    tokens.append("NUM")
                elif tok_type == tokenize.STRING:
                    tokens.append("STR")
                else:
                    tokens.append(tok_val)
            return tokens
        except Exception:
            pass
    # Fallback generic regex tokenizer
    clean = re.sub(r"//.*|/\*[\s\S]*?\*/|#.*", "", code)
    tokens = re.findall(r"\w+|[^\w\s]", clean)
    return [t for t in tokens if t.strip()]

def get_ast_node_sequence(code: str) -> List[str]:
    """Extracts canonical AST node type sequence for structural comparison."""
    try:
        tree = ast.parse(code)
        seq = []
        for node in ast.walk(tree):
            seq.append(type(node).__name__)
        return seq
    except Exception:
        # Fallback structural regex
        return re.findall(r"\b(def|class|for|while|if|else|elif|return|yield|try|except|import)\b", code)

def calculate_token_jaccard(tokens_a: List[str], tokens_b: List[str]) -> float:
    set_a = set(tokens_a)
    set_b = set(tokens_b)
    if not set_a and not set_b:
        return 1.0
    union = len(set_a.union(set_b))
    if union == 0:
        return 0.0
    return len(set_a.intersection(set_b)) / union

def calculate_ast_similarity(ast_a: List[str], ast_b: List[str]) -> float:
    set_a = set(ast_a)
    set_b = set(ast_b)
    if not set_a and not set_b:
        return 1.0
    union = len(set_a.union(set_b))
    if union == 0:
        return 0.0
    return len(set_a.intersection(set_b)) / union

def find_matching_snippets(code_a: str, code_b: str, min_lines: int = 3) -> List[Dict[str, Any]]:
    """Identifies contiguous matching lines of code between two submissions."""
    lines_a = [l.strip() for l in code_a.splitlines() if l.strip()]
    lines_b = [l.strip() for l in code_b.splitlines() if l.strip()]

    matches = []
    # Slide matching window
    for i in range(len(lines_a) - min_lines + 1):
        window_a = lines_a[i : i + min_lines]
        for j in range(len(lines_b) - min_lines + 1):
            window_b = lines_b[j : j + min_lines]
            if window_a == window_b:
                matches.append({
                    "line_a": i + 1,
                    "line_b": j + 1,
                    "length": min_lines,
                    "code_snippet": "\n".join(window_a)
                })
                break
    return matches[:5] # top 5 matching blocks

class HybridPlagiarismDetector:
    """
    IEEE-grade multi-layer similarity analysis combining:
    1. Token-level normalized sequence matching
    2. N-gram TF-IDF cosine similarity
    3. Abstract Syntax Tree (AST) structural invariant similarity
    """

    @classmethod
    def compare_submissions(
        cls,
        code_a: str,
        code_b: str,
        language: str = "python",
        starter_code: str = ""
    ) -> Dict[str, Any]:
        if not code_a.strip() or not code_b.strip():
            return {
                "similarity_score": 0.0,
                "token_similarity": 0.0,
                "tfidf_similarity": 0.0,
                "ast_similarity": 0.0,
                "matching_sections": [],
                "detection_method": "Hybrid Token+TF-IDF+AST",
            }

        # 1. Token similarity
        tokens_a = tokenize_code(code_a, language)
        tokens_b = tokenize_code(code_b, language)
        token_sim = calculate_token_jaccard(tokens_a, tokens_b)

        # 2. TF-IDF Cosine Similarity
        try:
            vectorizer = TfidfVectorizer(ngram_range=(1, 3), analyzer="word")
            tfidf_matrix = vectorizer.fit_transform([code_a, code_b])
            cos_matrix = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
            tfidf_sim = float(cos_matrix[0][0])
        except Exception:
            tfidf_sim = token_sim

        # 3. AST Structural Similarity
        ast_a = get_ast_node_sequence(code_a)
        ast_b = get_ast_node_sequence(code_b)
        ast_sim = calculate_ast_similarity(ast_a, ast_b)

        # Down-weight if matching parts are solely starter code
        if starter_code and starter_code.strip():
            starter_tokens = set(tokenize_code(starter_code, language))
            unique_a = set(tokens_a) - starter_tokens
            unique_b = set(tokens_b) - starter_tokens
            if unique_a and unique_b:
                token_sim = len(unique_a.intersection(unique_b)) / max(1, len(unique_a.union(unique_b)))

        # Weighted Hybrid Score
        composite_score = (0.35 * token_sim) + (0.35 * tfidf_sim) + (0.30 * ast_sim)
        composite_pct = round(max(0.0, min(100.0, composite_score * 100.0)), 2)

        matches = find_matching_snippets(code_a, code_b)

        return {
            "similarity_score": composite_pct,
            "token_similarity": round(token_sim * 100.0, 2),
            "tfidf_similarity": round(tfidf_sim * 100.0, 2),
            "ast_similarity": round(ast_sim * 100.0, 2),
            "matching_sections": matches,
            "detection_method": "Hybrid Token(35%) + TF-IDF(35%) + AST(30%)",
        }

    @classmethod
    def batch_compare(
        cls,
        submissions: List[Dict[str, Any]],
        starter_code: str = "",
        threshold: float = 65.0
    ) -> List[Dict[str, Any]]:
        """
        Runs pairwise similarity detection over a list of submissions for a question.
        Returns flagged pairs exceeding the threshold.
        """
        flagged = []
        n = len(submissions)
        for i in range(n):
            for j in range(i + 1, n):
                sub_a = submissions[i]
                sub_b = submissions[j]
                # Compare only if different students
                if sub_a.get("student_id") == sub_b.get("student_id"):
                    continue

                res = cls.compare_submissions(
                    code_a=sub_a["source_code"],
                    code_b=sub_b["source_code"],
                    language=sub_a.get("programming_language", "python"),
                    starter_code=starter_code
                )

                if res["similarity_score"] >= threshold:
                    flagged.append({
                        "submission_a_id": sub_a["id"],
                        "submission_b_id": sub_b["id"],
                        "student_a_id": sub_a.get("student_id"),
                        "student_b_id": sub_b.get("student_id"),
                        "student_a_name": sub_a.get("student_name", "Student A"),
                        "student_b_name": sub_b.get("student_name", "Student B"),
                        "similarity_score": res["similarity_score"],
                        "token_similarity": res["token_similarity"],
                        "tfidf_similarity": res["tfidf_similarity"],
                        "ast_similarity": res["ast_similarity"],
                        "matching_sections": res["matching_sections"],
                        "detection_method": res["detection_method"],
                    })
        return flagged
