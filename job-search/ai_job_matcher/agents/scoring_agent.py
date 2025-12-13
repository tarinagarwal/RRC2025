"""Scoring Agent - Calculates match scores between resume and jobs"""
import json
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from ..config import OPENAI_API_KEY, OPENAI_CHAT_MODEL, SCORING_WEIGHTS
from ..models import JobMatch
from ..embeddings import SkillEmbeddings
from .state import AgentState


llm = ChatOpenAI(api_key=OPENAI_API_KEY, model=OPENAI_CHAT_MODEL, temperature=0)


SKILL_EXTRACTION_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """Extract required skills from this job description.
Return JSON with:
- required_skills: list of technical skills/technologies required
- experience_years: estimated years required (int, 0 if not specified)
- education_required: degree level if mentioned (e.g., "Bachelor's", "Master's", "")
- is_remote: bool if remote work mentioned"""),
    ("human", "Job: {title} at {company}\n\nDescription:\n{description}")
])


MATCH_ANALYSIS_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """Analyze how well this candidate matches the job.

Provide:
1. matching_skills: skills the candidate has that match the job
2. missing_skills: important skills the job needs that candidate lacks
3. match_reasons: 2-3 bullet points on why they're a good/bad fit
4. overall_assessment: brief assessment

Return as JSON."""),
    ("human", """CANDIDATE PROFILE:
Skills: {candidate_skills}
Experience: {years_exp} years
Education: {education}

JOB REQUIREMENTS:
Title: {job_title}
Required Skills: {job_skills}
Experience needed: {job_exp} years
Description: {job_desc}""")
])


class JobScorer:
    def __init__(self):
        self.embeddings = SkillEmbeddings()
    
    def extract_job_requirements(self, job: dict) -> dict:
        """Extract structured requirements from job description"""
        import math
        description = job.get("description", "")
        # Handle NaN and None values
        if description is None or (isinstance(description, float) and math.isnan(description)):
            description = ""
        if not description or len(str(description)) < 50:
            return {
                "required_skills": [],
                "experience_years": 0,
                "education_required": "",
                "is_remote": job.get("is_remote", False)
            }
        
        try:
            chain = SKILL_EXTRACTION_PROMPT | llm
            response = chain.invoke({
                "title": job.get("title", ""),
                "company": job.get("company", ""),
                "description": description[:2000]  # Limit length
            })
            
            content = response.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            
            return json.loads(content)
        except:
            return {
                "required_skills": [],
                "experience_years": 0,
                "education_required": "",
                "is_remote": False
            }
    
    def calculate_scores(self, profile, job: dict, job_reqs: dict) -> dict:
        """Calculate match scores"""
        scores = {}
        
        # Technical skills score (semantic similarity)
        candidate_skills = (
            profile.skills.technical + 
            profile.skills.tools + 
            profile.skills.languages
        )
        job_skills = job_reqs.get("required_skills", [])
        
        if candidate_skills and job_skills:
            scores["technical_score"] = self.embeddings.calculate_skill_overlap(
                job_skills, candidate_skills
            )
        else:
            scores["technical_score"] = 0.5  # Neutral if no data
        
        # Experience score
        candidate_exp = profile.years_of_experience
        required_exp = job_reqs.get("experience_years", 0)
        
        if required_exp == 0:
            scores["experience_score"] = 0.8  # No requirement = good
        elif candidate_exp >= required_exp:
            scores["experience_score"] = 1.0
        elif candidate_exp >= required_exp - 2:
            scores["experience_score"] = 0.7  # Close enough
        else:
            scores["experience_score"] = max(0.3, candidate_exp / required_exp)
        
        # Education score (simplified)
        scores["education_score"] = 0.8  # Default good
        
        # Location score
        job_location = job.get("location", "").lower()
        is_remote = job.get("is_remote", False) or job_reqs.get("is_remote", False)
        
        if is_remote and profile.is_remote_preferred:
            scores["location_score"] = 1.0
        elif any(loc.lower() in job_location for loc in profile.preferred_locations):
            scores["location_score"] = 1.0
        elif is_remote:
            scores["location_score"] = 0.9
        else:
            scores["location_score"] = 0.6
        
        # Overall weighted score
        scores["overall_score"] = (
            scores["technical_score"] * SCORING_WEIGHTS["technical_skills"] +
            scores["experience_score"] * SCORING_WEIGHTS["experience_level"] +
            scores["education_score"] * SCORING_WEIGHTS["education"] +
            scores["location_score"] * SCORING_WEIGHTS["location"] +
            0.5 * SCORING_WEIGHTS["soft_skills"]  # Default for soft skills
        )
        
        return scores
    
    def analyze_match(self, profile, job: dict, job_reqs: dict) -> dict:
        """Get detailed match analysis from LLM"""
        try:
            # Handle education - could be dict or object
            if profile.education:
                edu = profile.education[0]
                education_str = edu.degree if hasattr(edu, 'degree') else edu.get("degree", "")
            else:
                education_str = "Not specified"
            
            chain = MATCH_ANALYSIS_PROMPT | llm
            response = chain.invoke({
                "candidate_skills": ", ".join(profile.skills.technical[:15]),
                "years_exp": profile.years_of_experience,
                "education": education_str,
                "job_title": job.get("title", ""),
                "job_skills": ", ".join(job_reqs.get("required_skills", [])[:10]),
                "job_exp": job_reqs.get("experience_years", 0),
                "job_desc": job.get("description", "")[:1000]
            })
            
            content = response.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            
            return json.loads(content)
        except:
            return {
                "matching_skills": [],
                "missing_skills": [],
                "match_reasons": []
            }


def score_jobs(state: AgentState) -> AgentState:
    """Score all found jobs against resume profile"""
    profile = state.get("resume_profile")
    jobs = state.get("jobs_found", [])
    
    if not profile or not jobs:
        state["job_matches"] = []
        return state
    
    scorer = JobScorer()
    
    # Create embeddings from resume
    scorer.embeddings.create_resume_embeddings(state.get("resume_raw", {}))
    
    job_matches = []
    
    # First pass: quick scoring without LLM calls
    print(f"   [4/6] Scoring {len(jobs)} jobs...")
    
    for i, job in enumerate(jobs):
        if i % 10 == 0:
            print(f"         Processing job {i+1}/{len(jobs)}...")
        
        # Extract job requirements (with LLM for jobs with descriptions)
        job_reqs = scorer.extract_job_requirements(job)
        
        # Calculate scores
        scores = scorer.calculate_scores(profile, job, job_reqs)
        
        # Get detailed analysis for better skill gap data
        analysis = scorer.analyze_match(profile, job, job_reqs)
        
        # Create JobMatch object - handle NaN values
        import math
        def safe_str(val, default=""):
            if val is None or (isinstance(val, float) and math.isnan(val)):
                return default
            return str(val)
        
        def safe_float(val):
            if val is None or (isinstance(val, float) and math.isnan(val)):
                return None
            return float(val)
        
        match = JobMatch(
            job_id=safe_str(job.get("id"), ""),
            title=safe_str(job.get("title"), ""),
            company=safe_str(job.get("company"), ""),
            location=safe_str(job.get("location"), ""),
            job_url=safe_str(job.get("job_url"), ""),
            description=safe_str(job.get("description"), "")[:500] if job.get("description") else "",
            salary_min=safe_float(job.get("min_amount")),
            salary_max=safe_float(job.get("max_amount")),
            job_type=safe_str(job.get("job_type"), ""),
            overall_score=round(scores["overall_score"], 2),
            technical_score=round(scores["technical_score"], 2),
            experience_score=round(scores["experience_score"], 2),
            education_score=round(scores["education_score"], 2),
            location_score=round(scores["location_score"], 2),
            matching_skills=analysis.get("matching_skills", []),
            missing_skills=analysis.get("missing_skills", []),
            match_reasons=analysis.get("match_reasons", []),
        )
        
        job_matches.append(match)
    
    # Sort by overall score
    job_matches.sort(key=lambda x: x.overall_score, reverse=True)
    
    state["job_matches"] = job_matches
    state["top_matches"] = job_matches[:10]  # Top 10
    state["current_step"] = "jobs_scored"
    
    return state
