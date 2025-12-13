"""Pydantic models for structured data"""
from typing import Optional
from pydantic import BaseModel, Field


class Contact(BaseModel):
    name: str = ""
    phone: str = ""
    email: str = ""
    address: str = ""
    linkedin: str = ""
    github: str = ""
    portfolio: str = ""


class Education(BaseModel):
    degree: str = ""
    institution: str = ""
    location: str = ""
    start_year: str = ""
    end_year: str = ""
    grade: str = ""


class Experience(BaseModel):
    role: str = ""
    company: str = ""
    location: str = ""
    start_date: str = ""
    end_date: str = ""
    description: str = ""


class Project(BaseModel):
    title: str = ""
    description: str = ""
    technologies: list[str] = []


class Skills(BaseModel):
    technical: list[str] = []
    soft: list[str] = []
    tools: list[str] = []
    languages: list[str] = []


class ResumeProfile(BaseModel):
    """Structured resume profile"""
    contact: Contact = Field(default_factory=Contact)
    summary: str = ""
    education: list[Education] = []
    skills: Skills = Field(default_factory=Skills)
    experience: list[Experience] = []
    projects: list[Project] = []
    certifications: list[dict] = []
    
    # Derived fields for job matching
    years_of_experience: int = 0
    target_roles: list[str] = []
    preferred_locations: list[str] = []
    is_remote_preferred: bool = False


class JobMatch(BaseModel):
    """Job with match score"""
    job_id: str
    title: str
    company: str
    location: str
    job_url: str
    description: str = ""
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    job_type: str = ""
    
    # Match scores
    overall_score: float = 0.0
    technical_score: float = 0.0
    experience_score: float = 0.0
    education_score: float = 0.0
    location_score: float = 0.0
    
    # Analysis
    matching_skills: list[str] = []
    missing_skills: list[str] = []
    match_reasons: list[str] = []


class CareerGuidance(BaseModel):
    """Career guidance and recommendations"""
    skill_gaps: list[str] = []
    learning_recommendations: list[dict] = []
    resume_improvements: list[str] = []
    career_paths: list[str] = []
    interview_tips: list[str] = []
    salary_insights: str = ""
