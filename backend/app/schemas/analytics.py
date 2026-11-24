from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class AdminAnalyticsResponse(BaseModel):
    total_users: int
    total_students: int
    total_instructors: int
    total_assessments: int
    total_questions: int
    total_submissions: int
    active_examinations: int
    average_assessment_score: float
    flagged_plagiarism_cases: int
    monthly_activity: List[Dict[str, Any]]
    score_distribution: List[Dict[str, Any]]
    language_usage: List[Dict[str, Any]]
    verdict_distribution: List[Dict[str, Any]]
    plagiarism_stats: Dict[str, Any]
    recent_activities: List[Dict[str, Any]]
    recent_submissions: List[Dict[str, Any]]
    upcoming_assessments: List[Dict[str, Any]]
    system_status: Dict[str, Any]

class InstructorAnalyticsResponse(BaseModel):
    total_assessments: int
    total_submissions: int
    average_class_score: float
    highest_score: float
    lowest_score: float
    assessment_participation: List[Dict[str, Any]]
    question_success_rates: List[Dict[str, Any]]
    difficult_questions: List[Dict[str, Any]]
    student_rankings: List[Dict[str, Any]]
    language_distribution: List[Dict[str, Any]]
    plagiarism_summary: Dict[str, Any]

class StudentAnalyticsResponse(BaseModel):
    total_assessments_attempted: int
    average_score: float
    highest_score: float
    lowest_score: float
    problems_solved: int
    acceptance_rate: float
    submission_count: int
    language_usage: Dict[str, int]
    topic_performance: List[Dict[str, Any]]
    coding_progress: List[Dict[str, Any]]
    recent_submissions: List[Dict[str, Any]]
