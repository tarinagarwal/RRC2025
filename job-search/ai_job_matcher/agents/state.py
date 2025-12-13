"""LangGraph State Definition"""
from typing import TypedDict, Annotated
from operator import add

from ..models import ResumeProfile, JobMatch, CareerGuidance


class AgentState(TypedDict):
    """State that flows through the LangGraph workflow"""
    
    # Input
    resume_path: str
    search_preferences: dict  # location, remote, salary expectations
    
    # Resume parsing
    resume_raw: dict  # Raw parsed resume data
    resume_profile: ResumeProfile | None
    
    # Job search
    search_queries: list[str]  # Generated search queries
    jobs_found: list[dict]  # Raw jobs from JobSpy
    
    # Matching & Scoring
    job_matches: list[JobMatch]  # Jobs with scores
    top_matches: list[JobMatch]  # Top N matches
    
    # Career guidance
    career_guidance: CareerGuidance | None
    
    # Conversation
    messages: Annotated[list, add]
    
    # Status
    current_step: str
    errors: list[str]
