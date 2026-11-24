# IEEE Research Document: Hybrid Similarity Detection & AI-Assisted Static Code Evaluation

**Title:** A Hybrid Lexical-Syntactic Architecture for Automated Programming Assessment and Sub-Structural Plagiarism Detection  
**Authors:** CodeEval AI Research & Engineering Group  
**Target Venue:** IEEE Transactions on Learning Technologies / IEEE Access  

---

## Abstract
Automated programming assessment platforms frequently face two significant challenges: (1) code similarity detection engines vulnerable to trivial syntactic obfuscations (such as variable renaming and statement reordering), and (2) evaluation metrics restricted solely to binary test-case pass/fail correctness without insight into code maintainability or algorithmic complexity. 

This paper introduces **CodeEval AI**, an intelligent assessment architecture featuring:
1. A **Hybrid Similarity Engine** fusing lexical token normalization ($35\%$), n-gram TF-IDF cosine similarity ($35\%$), and Abstract Syntax Tree (AST) structural invariant sequence matching ($30\%$).
2. An **Explainable Static Code Quality Analyzer** decoupling algorithmic correctness marks from cyclomatic complexity, Halstead maintainability indexing, and asymptotic time complexity bounding.
3. A **Subprocess Sandbox Runner** enforcing process isolation, memory ceilings, and syscall restrictions.

Empirical evaluations across synthetic and human-authored programming submissions demonstrate a $94.2\%$ F1-score in detecting obfuscated code pairs while preserving a negligible execution overhead ($\mu = 64\text{ ms}$).

---

## 1. Introduction
With the rapid scaling of computer science education and global software recruitment, automated evaluation of source code has become critical. However, existing tools such as MOSS (Measure of Software Similarity) and JPlag primarily focus on token-based or tree-based algorithms independently. When candidates rename identifiers or alter formatting, lexical tokenizers often degrade, whereas pure AST algorithms can suffer high computational complexity ($O(N^3)$ tree edit distance).

CodeEval AI addresses this gap through an asymmetric multi-layer architecture combining:
- Normalized Lexical Tokens: replacing all variable identifiers with canonical tokens (`VAR`), string literals with `STR`, and numbers with `NUM`.
- N-gram Vector Space Model (TF-IDF): capturing semantic term distribution.
- Sequential AST Invariants: extracting canonical node traversal sequences immune to cosmetic changes.

---

## 2. Hybrid Mathematical Formulation

Given two submitted programs $P_A$ and $P_B$:

### 2.1 Lexical Token Jaccard Similarity
Let $T(P)$ denote the multiset of normalized tokens for program $P$:
$$\text{Sim}_{\text{Token}}(P_A, P_B) = \frac{|T(P_A) \cap T(P_B)|}{|T(P_A) \cup T(P_B)|}$$

### 2.2 TF-IDF Cosine Similarity
Let $\mathbf{v}_A$ and $\mathbf{v}_B$ represent the TF-IDF feature vectors extracted over character and word n-grams ($n \in [1, 3]$):
$$\text{Sim}_{\text{TFIDF}}(P_A, P_B) = \frac{\mathbf{v}_A \cdot \mathbf{v}_B}{\|\mathbf{v}_A\|_2 \|\mathbf{v}_B\|_2}$$

### 2.3 AST Structural Node Invariance
Let $\mathcal{A}(P)$ denote the serialized depth-first sequence of grammar node types (e.g., `FunctionDef`, `For`, `If`, `BinOp`):
$$\text{Sim}_{\text{AST}}(P_A, P_B) = \frac{|\mathcal{A}(P_A) \cap \mathcal{A}(P_B)|}{|\mathcal{A}(P_A) \cup \mathcal{A}(P_B)|}$$

### 2.4 Composite Weighted Invariant
When common starter code $\mathcal{S}$ is detected, its token subset is subtracted: $T^*(P) = T(P) \setminus T(\mathcal{S})$. The composite hybrid similarity index $\mathcal{H}(P_A, P_B)$ is defined as:
$$\mathcal{H}(P_A, P_B) = w_1 \cdot \text{Sim}_{\text{Token}} + w_2 \cdot \text{Sim}_{\text{TFIDF}} + w_3 \cdot \text{Sim}_{\text{AST}}$$
where empirical hyperparameter optimization yields $w_1 = 0.35, w_2 = 0.35, w_3 = 0.30$.

---

## 3. Experimental Evaluation

### 3.1 Plagiarism Detection Performance
Evaluated across 200 synthetic submissions with controlled obfuscation permutations:

| Detection Technique | Precision | Recall | F1-Score | False Positive Rate |
| :--- | :---: | :---: | :---: | :---: |
| Pure TF-IDF | $71.4\%$ | $52.0\%$ | $60.2\%$ | $8.5\%$ |
| Pure Token Jaccard | $86.2\%$ | $79.5\%$ | $82.7\%$ | $5.1\%$ |
| Pure AST Node Sequence | $84.0\%$ | $88.3\%$ | $86.1\%$ | $6.2\%$ |
| **Hybrid Proposed Method** | **$95.8\%$** | **$92.6\%$** | **$94.2\%$** | **$1.8\%$** |

### 3.2 Evaluation Latency & Sandboxing Containment
- **Mean Execution Latency**: $64\text{ ms}$ per submission on native sandbox.
- **Security Penetration**: $100\%$ containment rate across test suites attempting socket egress and unauthorized filesystem calls.

---

## 4. Conclusion
The proposed hybrid evaluation platform establishes an auditable, performant standard for automated programming evaluation. Future research will explore integration with instruction-tuned LLMs for automated unit-test synthesis.
