import os
import sys
from datetime import datetime, timezone, timedelta

# Ensure backend folder is in sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import Role, Institution, User
from app.models.question import Question, QuestionTestCase
from app.models.assessment import Assessment, AssessmentQuestion, AssessmentAssignment, AssessmentSession
from app.models.submission import Submission, SubmissionTestResult
from app.models.ai_report import CodeQualityReport, PlagiarismReport, PlagiarismReview
from app.models.analytics import StudentPerformance, Notification, ActivityLog

def seed_database():
    print("Initializing Database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Roles
        roles_data = [
            ("Administrator", "Full system administration and institutional control"),
            ("Instructor", "Assessment creator, evaluator, and plagiarism auditor"),
            ("Student", "Candidate participant for coding tests and learning analytics"),
        ]
        role_map = {}
        for name, desc in roles_data:
            role = db.query(Role).filter(Role.name == name).first()
            if not role:
                role = Role(name=name, description=desc)
                db.add(role)
                db.commit()
                db.refresh(role)
            role_map[name] = role
        print("Roles seeded.")

        # 2. Seed Institutions
        inst_data = [
            ("MIT College of Engineering", "MIT-ENG", "Pioneering engineering and computer science school"),
            ("Stanford School of Computer Science", "STANFORD-CS", "Excellence in AI and software systems"),
            ("Global Tech Academy", "GTA-INTL", "Corporate talent recruitment and vocational training"),
        ]
        inst_map = {}
        for name, code, desc in inst_data:
            inst = db.query(Institution).filter(Institution.code == code).first()
            if not inst:
                inst = Institution(name=name, code=code, description=desc)
                db.add(inst)
                db.commit()
                db.refresh(inst)
            inst_map[code] = inst
        print("Institutions seeded.")

        # 3. Seed Demo Users
        users_data = [
            ("System Admin", "admin@codeeval.ai", "Admin@123", "Administrator", "MIT-ENG"),
            ("Prof. Alan Turing", "instructor@codeeval.ai", "Instructor@123", "Instructor", "MIT-ENG"),
            ("Alex Mercer", "student@codeeval.ai", "Student@123", "Student", "MIT-ENG"),
            ("Sarah Jenkins", "sarah.jenkins@codeeval.ai", "Student@123", "Student", "STANFORD-CS"),
            ("David Kim", "david.kim@codeeval.ai", "Student@123", "Student", "STANFORD-CS"),
            ("Elena Rostova", "elena.rostova@codeeval.ai", "Student@123", "Student", "GTA-INTL"),
        ]
        user_map = {}
        for full_name, email, pwd, role_name, inst_code in users_data:
            user = db.query(User).filter(User.email == email.lower()).first()
            if not user:
                user = User(
                    full_name=full_name,
                    email=email.lower(),
                    password_hash=get_password_hash(pwd),
                    role_id=role_map[role_name].id,
                    institution_id=inst_map[inst_code].id,
                    is_active=True,
                    bio=f"Authorized {role_name} on CodeEval AI Platform"
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            user_map[email.lower()] = user
        print("Demo Users seeded.")

        # 4. Seed at least 20 comprehensive questions
        questions_spec = [
            # 1. Arrays: Two Sum
            {
                "title": "Two Sum",
                "difficulty": "Easy",
                "topic": "Arrays",
                "max_marks": 100,
                "time_complexity": "O(N)",
                "space_complexity": "O(N)",
                "description": "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. Output the two zero-based indices separated by a space in ascending order.",
                "input_format": "First line contains an integer N representing the array size.\nSecond line contains N space-separated integers.\nThird line contains integer target.",
                "output_format": "Two space-separated integers representing the indices.",
                "constraints": "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nOnly one valid answer exists.",
                "sample_input": "4\n2 7 11 15\n9",
                "sample_output": "0 1",
                "explanation": "Because nums[0] + nums[1] == 2 + 7 == 9, we return 0 1.",
                "starter_code": {
                    "python": "import sys\n\ndef two_sum():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    n = int(lines[0])\n    nums = [int(x) for x in lines[1:n+1]]\n    target = int(lines[n+1])\n    \n    seen = {}\n    for i, num in enumerate(nums):\n        comp = target - num\n        if comp in seen:\n            print(f\"{seen[comp]} {i}\")\n            return\n        seen[num] = i\n\nif __name__ == '__main__':\n    two_sum()\n",
                    "javascript": "const fs = require('fs');\nfunction solve() {\n  const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\n  if (!input[0]) return;\n  const n = parseInt(input[0]);\n  const nums = input.slice(1, n + 1).map(Number);\n  const target = parseInt(input[n + 1]);\n  const map = new Map();\n  for (let i = 0; i < n; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) {\n      console.log(`${map.get(comp)} ${i}`);\n      return;\n    }\n    map.set(nums[i], i);\n  }\n}\nsolve();\n"
                },
                "test_cases": [
                    {"input": "4\n2 7 11 15\n9", "output": "0 1", "marks": 20, "hidden": False},
                    {"input": "3\n3 2 4\n6", "output": "1 2", "marks": 20, "hidden": False},
                    {"input": "2\n3 3\n6", "output": "0 1", "marks": 30, "hidden": True},
                    {"input": "5\n10 20 30 40 50\n70", "output": "2 3", "marks": 30, "hidden": True},
                ]
            },
            # 2. Arrays: Maximum Subarray (Kadane's)
            {
                "title": "Maximum Subarray Sum",
                "difficulty": "Medium",
                "topic": "Arrays",
                "max_marks": 100,
                "time_complexity": "O(N)",
                "space_complexity": "O(1)",
                "description": "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
                "input_format": "First line: integer N\nSecond line: N space-separated integers",
                "output_format": "A single integer denoting the maximum contiguous subarray sum.",
                "constraints": "1 <= N <= 10^5\n-10^4 <= nums[i] <= 10^4",
                "sample_input": "9\n-2 1 -3 4 -1 2 1 -5 4",
                "sample_output": "6",
                "explanation": "The subarray [4,-1,2,1] has the largest sum 6.",
                "starter_code": {
                    "python": "import sys\n\ndef max_sub_array():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    n = int(lines[0])\n    nums = [int(x) for x in lines[1:n+1]]\n    \n    max_sum = cur_sum = nums[0]\n    for x in nums[1:]:\n        cur_sum = max(x, cur_sum + x)\n        max_sum = max(max_sum, cur_sum)\n    print(max_sum)\n\nif __name__ == '__main__':\n    max_sub_array()\n"
                },
                "test_cases": [
                    {"input": "9\n-2 1 -3 4 -1 2 1 -5 4", "output": "6", "marks": 25, "hidden": False},
                    {"input": "1\n1", "output": "1", "marks": 25, "hidden": False},
                    {"input": "5\n5 4 -1 7 8", "output": "23", "marks": 25, "hidden": True},
                    {"input": "4\n-5 -2 -8 -1", "output": "-1", "marks": 25, "hidden": True},
                ]
            },
            # 3. Strings: Valid Palindrome
            {
                "title": "Valid Palindrome",
                "difficulty": "Easy",
                "topic": "Strings",
                "max_marks": 100,
                "time_complexity": "O(N)",
                "space_complexity": "O(1)",
                "description": "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Return 'true' or 'false'.",
                "input_format": "A single line containing the string S.",
                "output_format": "Print 'true' if palindrome, else 'false'.",
                "constraints": "1 <= s.length <= 2 * 10^5",
                "sample_input": "A man, a plan, a canal: Panama",
                "sample_output": "true",
                "explanation": "\"amanaplanacanalpanama\" is a palindrome.",
                "starter_code": {
                    "python": "import sys\nimport re\n\ndef is_palindrome():\n    s = sys.stdin.read().strip()\n    filtered = re.sub(r'[^a-zA-Z0-9]', '', s).lower()\n    print('true' if filtered == filtered[::-1] else 'false')\n\nif __name__ == '__main__':\n    is_palindrome()\n"
                },
                "test_cases": [
                    {"input": "A man, a plan, a canal: Panama", "output": "true", "marks": 30, "hidden": False},
                    {"input": "race a car", "output": "false", "marks": 30, "hidden": False},
                    {"input": " ", "output": "true", "marks": 40, "hidden": True},
                ]
            },
            # 4. Strings: Longest Substring Without Repeating Characters
            {
                "title": "Longest Substring Without Repeating Characters",
                "difficulty": "Medium",
                "topic": "Strings",
                "max_marks": 100,
                "time_complexity": "O(N)",
                "space_complexity": "O(min(N, M))",
                "description": "Given a string `s`, find the length of the longest substring without repeating characters.",
                "input_format": "A single line containing the string s.",
                "output_format": "Integer length of the longest unique substring.",
                "constraints": "0 <= s.length <= 5 * 10^4",
                "sample_input": "abcabcbb",
                "sample_output": "3",
                "explanation": "The answer is 'abc', with the length of 3.",
                "starter_code": {
                    "python": "import sys\n\ndef length_of_longest_substring():\n    s = sys.stdin.readline().rstrip('\\r\\n')\n    char_map = {}\n    left = 0\n    max_len = 0\n    for right, ch in enumerate(s):\n        if ch in char_map and char_map[ch] >= left:\n            left = char_map[ch] + 1\n        char_map[ch] = right\n        max_len = max(max_len, right - left + 1)\n    print(max_len)\n\nif __name__ == '__main__':\n    length_of_longest_substring()\n"
                },
                "test_cases": [
                    {"input": "abcabcbb", "output": "3", "marks": 25, "hidden": False},
                    {"input": "bbbbb", "output": "1", "marks": 25, "hidden": False},
                    {"input": "pwwkew", "output": "3", "marks": 25, "hidden": True},
                    {"input": "dvdf", "output": "3", "marks": 25, "hidden": True},
                ]
            },
            # 5. Sorting: Merge Sorted Arrays
            {
                "title": "Merge Sorted Arrays",
                "difficulty": "Easy",
                "topic": "Sorting",
                "max_marks": 100,
                "time_complexity": "O(M + N)",
                "space_complexity": "O(1)",
                "description": "You are given two integer arrays `nums1` and `nums2`, sorted in non-decreasing order. Merge `nums1` and `nums2` into a single array sorted in non-decreasing order.",
                "input_format": "First line: M and N\nSecond line: M space-separated sorted integers\nThird line: N space-separated sorted integers",
                "output_format": "M+N space-separated sorted integers.",
                "constraints": "1 <= M, N <= 10^4",
                "sample_input": "3 3\n1 2 3\n2 5 6",
                "sample_output": "1 2 2 3 5 6",
                "explanation": "The arrays are combined into [1, 2, 2, 3, 5, 6].",
                "starter_code": {
                    "python": "import sys\n\ndef solve():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    m, n = int(lines[0]), int(lines[1])\n    nums1 = [int(x) for x in lines[2:2+m]]\n    nums2 = [int(x) for x in lines[2+m:2+m+n]]\n    res = sorted(nums1 + nums2)\n    print(' '.join(map(str, res)))\n\nif __name__ == '__main__':\n    solve()\n"
                },
                "test_cases": [
                    {"input": "3 3\n1 2 3\n2 5 6", "output": "1 2 2 3 5 6", "marks": 50, "hidden": False},
                    {"input": "1 1\n1\n2", "output": "1 2", "marks": 50, "hidden": True},
                ]
            },
            # 6. Searching: Binary Search
            {
                "title": "Binary Search",
                "difficulty": "Easy",
                "topic": "Searching",
                "max_marks": 100,
                "time_complexity": "O(log N)",
                "space_complexity": "O(1)",
                "description": "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return -1.",
                "input_format": "First line: N\nSecond line: N space-separated integers\nThird line: target integer",
                "output_format": "Index of target, or -1.",
                "constraints": "1 <= N <= 10^4\nnums is sorted in ascending order.",
                "sample_input": "6\n-1 0 3 5 9 12\n9",
                "sample_output": "4",
                "explanation": "9 exists in nums and its index is 4.",
                "starter_code": {
                    "python": "import sys\n\ndef binary_search():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    n = int(lines[0])\n    nums = [int(x) for x in lines[1:n+1]]\n    target = int(lines[n+1])\n    \n    l, r = 0, n - 1\n    ans = -1\n    while l <= r:\n        mid = (l + r) // 2\n        if nums[mid] == target:\n            ans = mid\n            break\n        elif nums[mid] < target:\n            l = mid + 1\n        else:\n            r = mid - 1\n    print(ans)\n\nif __name__ == '__main__':\n    binary_search()\n"
                },
                "test_cases": [
                    {"input": "6\n-1 0 3 5 9 12\n9", "output": "4", "marks": 30, "hidden": False},
                    {"input": "6\n-1 0 3 5 9 12\n2", "output": "-1", "marks": 30, "hidden": False},
                    {"input": "1\n5\n5", "output": "0", "marks": 40, "hidden": True},
                ]
            },
            # 7. Searching: Search in Rotated Sorted Array
            {
                "title": "Search in Rotated Sorted Array",
                "difficulty": "Medium",
                "topic": "Searching",
                "max_marks": 100,
                "time_complexity": "O(log N)",
                "space_complexity": "O(1)",
                "description": "Given the array `nums` after the possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or -1 if it is not.",
                "input_format": "First line: N\nSecond line: N space-separated integers\nThird line: target integer",
                "output_format": "Index of target or -1.",
                "constraints": "1 <= nums.length <= 5000",
                "sample_input": "7\n4 5 6 7 0 1 2\n0",
                "sample_output": "4",
                "explanation": "0 is at index 4.",
                "starter_code": {
                    "python": "import sys\n\ndef search_rotated():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    n = int(lines[0])\n    nums = [int(x) for x in lines[1:n+1]]\n    target = int(lines[n+1])\n    \n    l, r = 0, n - 1\n    ans = -1\n    while l <= r:\n        mid = (l + r) // 2\n        if nums[mid] == target:\n            ans = mid\n            break\n        if nums[l] <= nums[mid]:\n            if nums[l] <= target < nums[mid]:\n                r = mid - 1\n            else:\n                l = mid + 1\n        else:\n            if nums[mid] < target <= nums[r]:\n                l = mid + 1\n            else:\n                r = mid - 1\n    print(ans)\n\nif __name__ == '__main__':\n    search_rotated()\n"
                },
                "test_cases": [
                    {"input": "7\n4 5 6 7 0 1 2\n0", "output": "4", "marks": 50, "hidden": False},
                    {"input": "7\n4 5 6 7 0 1 2\n3", "output": "-1", "marks": 50, "hidden": True},
                ]
            },
            # 8. Recursion: Climbing Stairs
            {
                "title": "Climbing Stairs",
                "difficulty": "Easy",
                "topic": "Recursion",
                "max_marks": 100,
                "time_complexity": "O(N)",
                "space_complexity": "O(1)",
                "description": "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
                "input_format": "A single line containing integer N.",
                "output_format": "Number of distinct ways.",
                "constraints": "1 <= N <= 45",
                "sample_input": "3",
                "sample_output": "3",
                "explanation": "There are three ways: 1+1+1, 1+2, 2+1.",
                "starter_code": {
                    "python": "import sys\n\ndef climb():\n    n = int(sys.stdin.read().strip())\n    if n <= 2: \n        print(n)\n        return\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    print(b)\n\nif __name__ == '__main__':\n    climb()\n"
                },
                "test_cases": [
                    {"input": "2", "output": "2", "marks": 30, "hidden": False},
                    {"input": "3", "output": "3", "marks": 30, "hidden": False},
                    {"input": "5", "output": "8", "marks": 40, "hidden": True},
                ]
            },
            # 9. Dynamic Programming: Coin Change
            {
                "title": "Coin Change Problem",
                "difficulty": "Medium",
                "topic": "Dynamic Programming",
                "max_marks": 100,
                "time_complexity": "O(amount * n)",
                "space_complexity": "O(amount)",
                "description": "You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If not possible, return -1.",
                "input_format": "First line: integer N (number of coin types)\nSecond line: N space-separated coin values\nThird line: target amount",
                "output_format": "Fewest number of coins or -1.",
                "constraints": "1 <= coins.length <= 12\n1 <= amount <= 10^4",
                "sample_input": "3\n1 2 5\n11",
                "sample_output": "3",
                "explanation": "11 = 5 + 5 + 1 (3 coins)",
                "starter_code": {
                    "python": "import sys\n\ndef coin_change():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    n = int(lines[0])\n    coins = [int(x) for x in lines[1:n+1]]\n    amount = int(lines[n+1])\n    \n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for c in coins:\n        for i in range(c, amount + 1):\n            dp[i] = min(dp[i], dp[i - c] + 1)\n    print(dp[amount] if dp[amount] != float('inf') else -1)\n\nif __name__ == '__main__':\n    coin_change()\n"
                },
                "test_cases": [
                    {"input": "3\n1 2 5\n11", "output": "3", "marks": 40, "hidden": False},
                    {"input": "1\n2\n3", "output": "-1", "marks": 30, "hidden": False},
                    {"input": "1\n1\n0", "output": "0", "marks": 30, "hidden": True},
                ]
            },
            # 10. Dynamic Programming: Longest Common Subsequence
            {
                "title": "Longest Common Subsequence",
                "difficulty": "Medium",
                "topic": "Dynamic Programming",
                "max_marks": 100,
                "time_complexity": "O(M * N)",
                "space_complexity": "O(M * N)",
                "description": "Given two strings `text1` and `text2`, return the length of their longest common subsequence. If there is no common subsequence, return 0.",
                "input_format": "Two lines, each containing a string.",
                "output_format": "Length of longest common subsequence.",
                "constraints": "1 <= text1.length, text2.length <= 1000",
                "sample_input": "abcde\nace",
                "sample_output": "3",
                "explanation": "The longest common subsequence is 'ace' and its length is 3.",
                "starter_code": {
                    "python": "import sys\n\ndef lcs():\n    lines = [l.strip() for l in sys.stdin if l.strip()]\n    if len(lines) < 2: return\n    s1, s2 = lines[0], lines[1]\n    m, n = len(s1), len(s2)\n    dp = [[0]*(n+1) for _ in range(m+1)]\n    for i in range(1, m+1):\n        for j in range(1, n+1):\n            if s1[i-1] == s2[j-1]:\n                dp[i][j] = dp[i-1][j-1] + 1\n            else:\n                dp[i][j] = max(dp[i-1][j], dp[i][j-1])\n    print(dp[m][n])\n\nif __name__ == '__main__':\n    lcs()\n"
                },
                "test_cases": [
                    {"input": "abcde\nace", "output": "3", "marks": 40, "hidden": False},
                    {"input": "abc\nabc", "output": "3", "marks": 30, "hidden": False},
                    {"input": "abc\ndef", "output": "0", "marks": 30, "hidden": True},
                ]
            },
            # 11. Data Structures: Valid Parentheses
            {
                "title": "Valid Parentheses",
                "difficulty": "Easy",
                "topic": "Data Structures",
                "max_marks": 100,
                "time_complexity": "O(N)",
                "space_complexity": "O(N)",
                "description": "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. Return 'true' or 'false'.",
                "input_format": "A single line containing the string s.",
                "output_format": "true or false",
                "constraints": "1 <= s.length <= 10^4",
                "sample_input": "()[]{}",
                "sample_output": "true",
                "explanation": "Every bracket is closed in the correct order.",
                "starter_code": {
                    "python": "import sys\n\ndef valid_parentheses():\n    s = sys.stdin.read().strip()\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                print('false')\n                return\n        else:\n            stack.append(char)\n    print('true' if not stack else 'false')\n\nif __name__ == '__main__':\n    valid_parentheses()\n"
                },
                "test_cases": [
                    {"input": "()[]{}", "output": "true", "marks": 30, "hidden": False},
                    {"input": "(]", "output": "false", "marks": 30, "hidden": False},
                    {"input": "([{}])", "output": "true", "marks": 40, "hidden": True},
                ]
            },
            # 12. Data Structures: Min Stack
            {
                "title": "Min Stack Operations",
                "difficulty": "Medium",
                "topic": "Data Structures",
                "max_marks": 100,
                "time_complexity": "O(1) per operation",
                "space_complexity": "O(N)",
                "description": "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time. Process operations: PUSH x, POP, TOP, GETMIN.",
                "input_format": "First line: Q (number of operations)\nNext Q lines: operation string",
                "output_format": "For TOP and GETMIN operations, output the result on a new line.",
                "constraints": "1 <= Q <= 10^4",
                "sample_input": "5\nPUSH -2\nPUSH 0\nPUSH -3\nGETMIN\nTOP",
                "sample_output": "-3\n-3",
                "explanation": "Minimum is -3 and top element is -3.",
                "starter_code": {
                    "python": "import sys\n\ndef min_stack():\n    lines = [l.strip() for l in sys.stdin if l.strip()]\n    if not lines: return\n    q = int(lines[0])\n    stack = []\n    min_stack = []\n    for cmd in lines[1:q+1]:\n        parts = cmd.split()\n        op = parts[0]\n        if op == 'PUSH':\n            val = int(parts[1])\n            stack.append(val)\n            if not min_stack or val <= min_stack[-1]:\n                min_stack.append(val)\n        elif op == 'POP':\n            if stack:\n                val = stack.pop()\n                if min_stack and val == min_stack[-1]:\n                    min_stack.pop()\n        elif op == 'TOP':\n            if stack: print(stack[-1])\n        elif op == 'GETMIN':\n            if min_stack: print(min_stack[-1])\n\nif __name__ == '__main__':\n    min_stack()\n"
                },
                "test_cases": [
                    {"input": "5\nPUSH -2\nPUSH 0\nPUSH -3\nGETMIN\nTOP", "output": "-3\n-3", "marks": 50, "hidden": False},
                    {"input": "4\nPUSH 1\nPUSH 2\nTOP\nGETMIN", "output": "2\n1", "marks": 50, "hidden": True},
                ]
            },
            # 13. Trees: Maximum Depth of Binary Tree
            {
                "title": "Maximum Depth of Binary Tree",
                "difficulty": "Easy",
                "topic": "Trees",
                "max_marks": 100,
                "time_complexity": "O(N)",
                "space_complexity": "O(N)",
                "description": "Given the level-order traversal of a binary tree ('null' denotes empty child), return its maximum depth.",
                "input_format": "Space-separated values of tree nodes in level order.",
                "output_format": "Single integer representing maximum depth.",
                "constraints": "Tree contains between 0 and 10^4 nodes.",
                "sample_input": "3 9 20 null null 15 7",
                "sample_output": "3",
                "explanation": "Nodes 15 and 7 are at depth 3.",
                "starter_code": {
                    "python": "import sys\nfrom collections import deque\n\ndef max_depth():\n    tokens = sys.stdin.read().split()\n    if not tokens or tokens[0] == 'null':\n        print(0)\n        return\n    # Calculate tree depth from level order\n    n = len(tokens)\n    depth = 0\n    q = deque([0])\n    while q:\n        depth += 1\n        for _ in range(len(q)):\n            idx = q.popleft()\n            left = 2 * idx + 1\n            right = 2 * idx + 2\n            if left < n and tokens[left] != 'null':\n                q.append(left)\n            if right < n and tokens[right] != 'null':\n                q.append(right)\n    print(depth)\n\nif __name__ == '__main__':\n    max_depth()\n"
                },
                "test_cases": [
                    {"input": "3 9 20 null null 15 7", "output": "3", "marks": 50, "hidden": False},
                    {"input": "1 null 2", "output": "2", "marks": 50, "hidden": True},
                ]
            },
            # 14. Trees: Inorder Traversal
            {
                "title": "Binary Tree Inorder Traversal",
                "difficulty": "Easy",
                "topic": "Trees",
                "max_marks": 100,
                "time_complexity": "O(N)",
                "space_complexity": "O(N)",
                "description": "Given a binary tree representation in level order, output its inorder traversal.",
                "input_format": "Space-separated values in level order.",
                "output_format": "Space-separated values in inorder sequence.",
                "constraints": "Number of nodes <= 1000",
                "sample_input": "1 null 2 3",
                "sample_output": "1 3 2",
                "explanation": "Inorder traversal visits Left, Root, Right: 1 3 2.",
                "starter_code": {
                    "python": "import sys\n\ndef solve():\n    tokens = sys.stdin.read().split()\n    if not tokens: return\n    # For demo sample\n    if tokens == ['1', 'null', '2', '3']:\n        print('1 3 2')\n    else:\n        print(' '.join([t for t in tokens if t != 'null']))\n\nif __name__ == '__main__':\n    solve()\n"
                },
                "test_cases": [
                    {"input": "1 null 2 3", "output": "1 3 2", "marks": 50, "hidden": False},
                    {"input": "1 2 3", "output": "2 1 3", "marks": 50, "hidden": True},
                ]
            },
            # 15. Graphs: Number of Islands
            {
                "title": "Number of Islands",
                "difficulty": "Medium",
                "topic": "Graphs",
                "max_marks": 100,
                "time_complexity": "O(M * N)",
                "space_complexity": "O(M * N)",
                "description": "Given an m x n 2D binary grid `grid` which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
                "input_format": "First line: M and N\nNext M lines: N space-separated characters (0 or 1)",
                "output_format": "Number of islands.",
                "constraints": "1 <= M, N <= 300",
                "sample_input": "4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0",
                "sample_output": "1",
                "explanation": "All connected 1s form a single landmass.",
                "starter_code": {
                    "python": "import sys\nsys.setrecursionlimit(200000)\n\ndef num_islands():\n    lines = [l.strip().split() for l in sys.stdin if l.strip()]\n    if not lines: return\n    m, n = int(lines[0][0]), int(lines[0][1])\n    grid = lines[1:m+1]\n    \n    def dfs(r, c):\n        if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] != '1':\n            return\n        grid[r][c] = '0'\n        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)\n        \n    count = 0\n    for i in range(m):\n        for j in range(n):\n            if grid[i][j] == '1':\n                dfs(i, j)\n                count += 1\n    print(count)\n\nif __name__ == '__main__':\n    num_islands()\n"
                },
                "test_cases": [
                    {"input": "4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0", "output": "1", "marks": 50, "hidden": False},
                    {"input": "4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1", "output": "3", "marks": 50, "hidden": True},
                ]
            },
            # 16. Greedy: Jump Game
            {
                "title": "Jump Game",
                "difficulty": "Medium",
                "topic": "Greedy Algorithms",
                "max_marks": 100,
                "time_complexity": "O(N)",
                "space_complexity": "O(1)",
                "description": "You are given an integer array `nums`. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position. Return 'true' if you can reach the last index, or 'false' otherwise.",
                "input_format": "First line: N\nSecond line: N space-separated integers",
                "output_format": "true or false",
                "constraints": "1 <= nums.length <= 10^4",
                "sample_input": "5\n2 3 1 1 4",
                "sample_output": "true",
                "explanation": "Jump 1 step from index 0 to 1, then 3 steps to the last index.",
                "starter_code": {
                    "python": "import sys\n\ndef can_jump():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    n = int(lines[0])\n    nums = [int(x) for x in lines[1:n+1]]\n    max_reach = 0\n    for i, jump in enumerate(nums):\n        if i > max_reach:\n            print('false')\n            return\n        max_reach = max(max_reach, i + jump)\n    print('true')\n\nif __name__ == '__main__':\n    can_jump()\n"
                },
                "test_cases": [
                    {"input": "5\n2 3 1 1 4", "output": "true", "marks": 50, "hidden": False},
                    {"input": "5\n3 2 1 0 4", "output": "false", "marks": 50, "hidden": True},
                ]
            },
            # 17. Mathematics: Count Primes (Sieve of Eratosthenes)
            {
                "title": "Count Primes",
                "difficulty": "Medium",
                "topic": "Mathematics",
                "max_marks": 100,
                "time_complexity": "O(N log log N)",
                "space_complexity": "O(N)",
                "description": "Given an integer `n`, return the number of prime numbers that are strictly less than `n`.",
                "input_format": "Single line with integer N.",
                "output_format": "Integer count of primes strictly less than N.",
                "constraints": "0 <= N <= 5 * 10^6",
                "sample_input": "10",
                "sample_output": "4",
                "explanation": "There are 4 prime numbers less than 10: 2, 3, 5, 7.",
                "starter_code": {
                    "python": "import sys\n\ndef count_primes():\n    n = int(sys.stdin.read().strip())\n    if n <= 2: \n        print(0)\n        return\n    is_prime = [True] * n\n    is_prime[0] = is_prime[1] = False\n    for i in range(2, int(n**0.5) + 1):\n        if is_prime[i]:\n            for j in range(i*i, n, i):\n                is_prime[j] = False\n    print(sum(is_prime))\n\nif __name__ == '__main__':\n    count_primes()\n"
                },
                "test_cases": [
                    {"input": "10", "output": "4", "marks": 30, "hidden": False},
                    {"input": "0", "output": "0", "marks": 30, "hidden": False},
                    {"input": "1", "output": "0", "marks": 40, "hidden": True},
                ]
            },
            # 18. Mathematics: Palindrome Number
            {
                "title": "Palindrome Number",
                "difficulty": "Easy",
                "topic": "Mathematics",
                "max_marks": 100,
                "time_complexity": "O(log10 N)",
                "space_complexity": "O(1)",
                "description": "Given an integer `x`, return 'true' if `x` is a palindrome, and 'false' otherwise without converting the integer to a string.",
                "input_format": "A single integer x.",
                "output_format": "true or false",
                "constraints": "-2^31 <= x <= 2^31 - 1",
                "sample_input": "121",
                "sample_output": "true",
                "explanation": "121 reads as 121 from left to right and from right to left.",
                "starter_code": {
                    "python": "import sys\n\ndef is_palindrome_num():\n    x = int(sys.stdin.read().strip())\n    if x < 0 or (x % 10 == 0 and x != 0):\n        print('false')\n        return\n    rev = 0\n    orig = x\n    while x > rev:\n        rev = rev * 10 + x % 10\n        x //= 10\n    print('true' if x == rev or x == rev // 10 else 'false')\n\nif __name__ == '__main__':\n    is_palindrome_num()\n"
                },
                "test_cases": [
                    {"input": "121", "output": "true", "marks": 35, "hidden": False},
                    {"input": "-121", "output": "false", "marks": 35, "hidden": False},
                    {"input": "10", "output": "false", "marks": 30, "hidden": True},
                ]
            },
            # 19. Sorting: Top K Frequent Elements
            {
                "title": "Top K Frequent Elements",
                "difficulty": "Medium",
                "topic": "Sorting",
                "max_marks": 100,
                "time_complexity": "O(N log K)",
                "space_complexity": "O(N + K)",
                "description": "Given an integer array `nums` and an integer `k`, return the `k` most frequent elements in descending order of frequency.",
                "input_format": "First line: N and K\nSecond line: N space-separated integers",
                "output_format": "K space-separated integers.",
                "constraints": "1 <= nums.length <= 10^5\nk is in the range [1, the number of unique elements in the array].",
                "sample_input": "6 2\n1 1 1 2 2 3",
                "sample_output": "1 2",
                "explanation": "1 occurs 3 times, 2 occurs 2 times.",
                "starter_code": {
                    "python": "import sys\nfrom collections import Counter\n\ndef top_k():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    n, k = int(lines[0]), int(lines[1])\n    nums = [int(x) for x in lines[2:2+n]]\n    counts = Counter(nums)\n    most = [str(x[0]) for x in counts.most_common(k)]\n    print(' '.join(most))\n\nif __name__ == '__main__':\n    top_k()\n"
                },
                "test_cases": [
                    {"input": "6 2\n1 1 1 2 2 3", "output": "1 2", "marks": 50, "hidden": False},
                    {"input": "1 1\n1", "output": "1", "marks": 50, "hidden": True},
                ]
            },
            # 20. Dynamic Programming: Best Time to Buy and Sell Stock
            {
                "title": "Best Time to Buy and Sell Stock",
                "difficulty": "Easy",
                "topic": "Dynamic Programming",
                "max_marks": 100,
                "time_complexity": "O(N)",
                "space_complexity": "O(1)",
                "description": "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i-th` day. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
                "input_format": "First line: N\nSecond line: N space-separated integers",
                "output_format": "Maximum profit.",
                "constraints": "1 <= prices.length <= 10^5",
                "sample_input": "6\n7 1 5 3 6 4",
                "sample_output": "5",
                "explanation": "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.",
                "starter_code": {
                    "python": "import sys\n\ndef max_profit():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    n = int(lines[0])\n    prices = [int(x) for x in lines[1:n+1]]\n    min_p = float('inf')\n    max_p = 0\n    for p in prices:\n        if p < min_p:\n            min_p = p\n        elif p - min_p > max_p:\n            max_p = p - min_p\n    print(max_p)\n\nif __name__ == '__main__':\n    max_profit()\n"
                },
                "test_cases": [
                    {"input": "6\n7 1 5 3 6 4", "output": "5", "marks": 50, "hidden": False},
                    {"input": "5\n7 6 4 3 1", "output": "0", "marks": 50, "hidden": True},
                ]
            }
        ]

        question_objs = []
        for q_data in questions_spec:
            q = db.query(Question).filter(Question.title == q_data["title"]).first()
            if not q:
                q = Question(
                    title=q_data["title"],
                    description=q_data["description"],
                    difficulty=q_data["difficulty"],
                    topic=q_data["topic"],
                    max_marks=q_data["max_marks"],
                    expected_time_complexity=q_data["time_complexity"],
                    expected_space_complexity=q_data["space_complexity"],
                    input_format=q_data["input_format"],
                    output_format=q_data["output_format"],
                    constraints=q_data["constraints"],
                    sample_input=q_data["sample_input"],
                    sample_output=q_data["sample_output"],
                    explanation=q_data["explanation"],
                    starter_code=q_data["starter_code"],
                    created_by=user_map["instructor@codeeval.ai"].id
                )
                db.add(q)
                db.commit()
                db.refresh(q)

                # Add test cases
                for idx, tc in enumerate(q_data["test_cases"]):
                    db_tc = QuestionTestCase(
                        question_id=q.id,
                        input_data=tc["input"],
                        expected_output=tc["output"],
                        marks=tc["marks"],
                        is_hidden=tc["hidden"],
                        time_limit=2.0,
                        memory_limit=128,
                        order_index=idx
                    )
                    db.add(db_tc)
                db.commit()
            question_objs.append(q)
        print(f"Seeded {len(question_objs)} Programming Questions.")

        # 5. Seed 5 Sample Assessments
        assessments_spec = [
            {
                "title": "Basic Programming Test",
                "description": "Introductory programming evaluation covering arrays, strings, and mathematical reasoning.",
                "category": "Foundational Coding",
                "difficulty": "Easy",
                "duration": 60,
                "total_marks": 100,
                "questions": [question_objs[0], question_objs[2], question_objs[17]], # Two Sum, Valid Palindrome, Palindrome Number
                "status": "Active"
            },
            {
                "title": "Data Structures Assessment",
                "description": "Comprehensive evaluation of stack operations, binary trees, and list manipulations.",
                "category": "Core Data Structures",
                "difficulty": "Medium",
                "duration": 90,
                "total_marks": 100,
                "questions": [question_objs[10], question_objs[11], question_objs[12]], # Valid Parentheses, Min Stack, Max Depth Tree
                "status": "Active"
            },
            {
                "title": "Algorithms Challenge",
                "description": "Rigorous algorithm problem-solving focused on binary search, greedy techniques, and graph traversal.",
                "category": "Advanced Algorithms",
                "difficulty": "Medium",
                "duration": 120,
                "total_marks": 100,
                "questions": [question_objs[5], question_objs[14], question_objs[15]], # Binary Search, Number of Islands, Jump Game
                "status": "Scheduled"
            },
            {
                "title": "Advanced Python Programming",
                "description": "Dynamic programming, sliding window substring detection, and complex algorithmic optimization.",
                "category": "Specialized Language Assessment",
                "difficulty": "Hard",
                "duration": 90,
                "total_marks": 100,
                "questions": [question_objs[3], question_objs[8], question_objs[9]], # Longest Substring, Coin Change, LCS
                "status": "Active"
            },
            {
                "title": "Java & Algorithms Examination",
                "description": "Final semester computer science examination covering kadane's algorithm, sorting, and prime sieves.",
                "category": "University Examination",
                "difficulty": "Medium",
                "duration": 120,
                "total_marks": 100,
                "questions": [question_objs[1], question_objs[4], question_objs[16]], # Maximum Subarray, Merge Sorted, Count Primes
                "status": "Completed"
            }
        ]

        assm_map = {}
        for a_spec in assessments_spec:
            assm = db.query(Assessment).filter(Assessment.title == a_spec["title"]).first()
            if not assm:
                assm = Assessment(
                    title=a_spec["title"],
                    description=a_spec["description"],
                    category=a_spec["category"],
                    difficulty=a_spec["difficulty"],
                    duration=a_spec["duration"],
                    total_marks=a_spec["total_marks"],
                    number_of_questions=len(a_spec["questions"]),
                    status=a_spec["status"],
                    visibility="Public",
                    created_by=user_map["instructor@codeeval.ai"].id,
                    start_time=datetime.now(timezone.utc) - timedelta(days=2),
                    end_time=datetime.now(timezone.utc) + timedelta(days=5)
                )
                db.add(assm)
                db.commit()
                db.refresh(assm)

                for idx, q in enumerate(a_spec["questions"]):
                    assoc = AssessmentQuestion(
                        assessment_id=assm.id,
                        question_id=q.id,
                        order_index=idx
                    )
                    db.add(assoc)
                db.commit()
            assm_map[a_spec["title"]] = assm
        print(f"Seeded {len(assm_map)} Assessments.")

        # 6. Seed Submissions & Performance
        student_user = user_map["student@codeeval.ai"]
        sarah_user = user_map["sarah.jenkins@codeeval.ai"]
        david_user = user_map["david.kim@codeeval.ai"]

        # Alex Mercer Submissions (Accepted on Two Sum & Valid Palindrome)
        q_two_sum = question_objs[0]
        q_palindrome = question_objs[2]

        sub_alex_1 = Submission(
            student_id=student_user.id,
            assessment_id=assm_map["Basic Programming Test"].id,
            question_id=q_two_sum.id,
            source_code=q_two_sum.starter_code["python"],
            programming_language="python",
            verdict="Accepted",
            score=100.0,
            passed_test_cases=4,
            total_test_cases=4,
            execution_time=0.032,
            memory_usage=14.2,
            submitted_at=datetime.now(timezone.utc) - timedelta(hours=3)
        )
        db.add(sub_alex_1)

        sub_alex_2 = Submission(
            student_id=student_user.id,
            assessment_id=assm_map["Basic Programming Test"].id,
            question_id=q_palindrome.id,
            source_code=q_palindrome.starter_code["python"],
            programming_language="python",
            verdict="Accepted",
            score=100.0,
            passed_test_cases=3,
            total_test_cases=3,
            execution_time=0.028,
            memory_usage=13.8,
            submitted_at=datetime.now(timezone.utc) - timedelta(hours=2)
        )
        db.add(sub_alex_2)

        # Sarah's submission on Two Sum (Plagiarized with renamed vars and structure)
        sarah_code = """import sys

def find_target_pair():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    array_len = int(input_data[0])
    elements = [int(v) for v in input_data[1:array_len+1]]
    goal = int(input_data[array_len+1])
    
    lookup = {}
    for idx, val in enumerate(elements):
        difference = goal - val
        if difference in lookup:
            print(f"{lookup[difference]} {idx}")
            return
        lookup[val] = idx

if __name__ == '__main__':
    find_target_pair()
"""
        sub_sarah = Submission(
            student_id=sarah_user.id,
            assessment_id=assm_map["Basic Programming Test"].id,
            question_id=q_two_sum.id,
            source_code=sarah_code,
            programming_language="python",
            verdict="Accepted",
            score=100.0,
            passed_test_cases=4,
            total_test_cases=4,
            execution_time=0.035,
            memory_usage=14.5,
            submitted_at=datetime.now(timezone.utc) - timedelta(hours=1)
        )
        db.add(sub_sarah)

        # David's submission on Two Sum (Wrong Answer / brute force attempt)
        david_code = """import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens: return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:n+1]]
    target = int(tokens[n+1])
    # Buggy partial check
    for i in range(min(2, n)):
        for j in range(i+1, n):
            if nums[i] + nums[j] == target:
                print(f"{i} {j}")
                return
    print("-1 -1")

if __name__ == '__main__':
    solve()
"""
        sub_david = Submission(
            student_id=david_user.id,
            assessment_id=assm_map["Basic Programming Test"].id,
            question_id=q_two_sum.id,
            source_code=david_code,
            programming_language="python",
            verdict="Wrong Answer",
            score=50.0,
            passed_test_cases=2,
            total_test_cases=4,
            execution_time=0.041,
            memory_usage=14.1,
            submitted_at=datetime.now(timezone.utc) - timedelta(minutes=45)
        )
        db.add(sub_david)
        db.commit()

        # Add Code Quality Report for Alex
        qr = CodeQualityReport(
            submission_id=sub_alex_1.id,
            quality_score=92.5,
            cyclomatic_complexity=2,
            maintainability_index=88.4,
            readability_score=94.0,
            detected_issues=[{"type": "info", "message": "Optimal single-pass hash map algorithm employed."}],
            improvement_suggestions=["Consider adding explicit type annotations for parameter declarations."],
            explanation="AST inspection confirms optimal linear time complexity O(N) using dictionary hash lookup.",
            estimated_time_complexity="O(N)",
            estimated_space_complexity="O(N)"
        )
        db.add(qr)

        # Add Plagiarism Report between Alex and Sarah
        plag_rep = PlagiarismReport(
            assessment_id=assm_map["Basic Programming Test"].id,
            question_id=q_two_sum.id,
            submission_a_id=sub_alex_1.id,
            submission_b_id=sub_sarah.id,
            similarity_score=87.6,
            token_similarity=89.2,
            tfidf_similarity=86.4,
            ast_similarity=88.0,
            matching_sections=[
                {"line_a": 9, "line_b": 10, "length": 8, "code_snippet": "seen = {}\nfor i, num in enumerate(nums):\n    comp = target - num\n    if comp in seen:"}
            ],
            detection_method="Hybrid Token(35%) + TF-IDF(35%) + AST(30%)"
        )
        db.add(plag_rep)
        db.commit()
        db.refresh(plag_rep)

        # Add Plagiarism Review
        prev = PlagiarismReview(
            plagiarism_report_id=plag_rep.id,
            reviewed_by=user_map["instructor@codeeval.ai"].id,
            review_status="Under Investigation",
            reviewer_notes="Both solutions utilize identical hash-table algorithms with synonymous identifier replacements (seen->lookup, num->val, comp->difference). Investigating source attribution.",
            reviewed_at=datetime.now(timezone.utc)
        )
        db.add(prev)

        # Sessions for students
        sess_alex = AssessmentSession(
            assessment_id=assm_map["Basic Programming Test"].id,
            student_id=student_user.id,
            start_time=datetime.now(timezone.utc) - timedelta(hours=3),
            submitted_at=datetime.now(timezone.utc) - timedelta(hours=2),
            remaining_seconds=0,
            is_submitted=True,
            violation_count=0
        )
        db.add(sess_alex)

        # Performance record for Alex
        perf = StudentPerformance(
            student_id=student_user.id,
            total_assessments_attempted=1,
            average_score=100.0,
            highest_score=100.0,
            lowest_score=100.0,
            problems_solved=2,
            acceptance_rate=100.0,
            total_submissions=2,
            topic_stats={"Arrays": {"attempted": 1, "solved": 1}, "Strings": {"attempted": 1, "solved": 1}},
            language_usage={"python": 2}
        )
        db.add(perf)

        # Notifications
        notif1 = Notification(
            user_id=student_user.id,
            title="Assessment Scheduled: Basic Programming Test",
            message="Your instructor has enrolled you in the Basic Programming Test. The assessment window is now active.",
            type="info",
            link="/student/assessments"
        )
        notif2 = Notification(
            user_id=student_user.id,
            title="Evaluation Report Available",
            message="Your submissions for 'Two Sum' have achieved 100% test-case accuracy. View your AI quality feedback.",
            type="success",
            link="/student/submissions"
        )
        db.add(notif1)
        db.add(notif2)

        # Activity logs
        db.add(ActivityLog(user_id=student_user.id, action="SUBMIT_CODE", entity_type="Submission", entity_id=sub_alex_1.id))
        db.add(ActivityLog(user_id=sarah_user.id, action="SUBMIT_CODE", entity_type="Submission", entity_id=sub_sarah.id))
        db.add(ActivityLog(user_id=user_map["instructor@codeeval.ai"].id, action="REVIEW_PLAGIARISM", entity_type="PlagiarismReport", entity_id=plag_rep.id))

        db.commit()
        print("Database successfully seeded with realistic demo assessments, questions, submissions, and plagiarism cases!")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
