"""Career Coach Agent - Provides guidance, gap analysis, and recommendations"""
import json
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from ..config import OPENAI_API_KEY, OPENAI_CHAT_MODEL
from ..models import CareerGuidance
from .state import AgentState


llm = ChatOpenAI(api_key=OPENAI_API_KEY, model=OPENAI_CHAT_MODEL, temperature=0.5)


CAREER_GUIDANCE_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are an expert career coach. Analyze the candidate's profile and job search results to provide actionable guidance.

You MUST respond with ONLY a valid JSON object (no markdown, no explanation, just JSON) with these fields:
{{
  "skill_gaps": ["skill1", "skill2", ...],
  "learning_recommendations": [{{"skill": "...", "resource": "...", "platform": "...", "estimated_time": "..."}}],
  "resume_improvements": ["suggestion1", "suggestion2", ...],
  "career_paths": ["path1", "path2", "path3"],
  "interview_tips": ["tip1", "tip2", ...],
  "salary_insights": "Brief insight on salary expectations"
}}

Be specific and actionable. Reference actual skills and job titles from the data."""),
    ("human", """CANDIDATE PROFILE:
Name: {name}
Years of Experience: {years_exp}
Current Skills: {skills}
Education: {education}
Target Roles: {target_roles}

JOB SEARCH RESULTS:
Total jobs found: {total_jobs}
Average match score: {avg_score}%

TOP MATCHING JOBS:
{top_jobs}

COMMONLY MISSING SKILLS (from job matches):
{missing_skills}

Respond with ONLY the JSON object, no other text.""")
])


def generate_career_guidance(state: AgentState) -> AgentState:
    """Generate personalized career guidance"""
    profile = state.get("resume_profile")
    job_matches = state.get("job_matches", [])
    top_matches = state.get("top_matches", [])
    
    if not profile:
        state["career_guidance"] = CareerGuidance()
        return state
    
    # Handle profile being either a ResumeProfile object or a dict
    if isinstance(profile, dict):
        contact_name = profile.get("contact", {}).get("name", "Unknown")
        years_exp = profile.get("years_of_experience", 0)
        skills_list = profile.get("skills", {}).get("technical", [])[:15]
        education_list = profile.get("education", [])
        education_str = education_list[0].get("degree", "") if education_list else "Not specified"
        target_roles_list = profile.get("target_roles", [])
    else:
        contact_name = profile.contact.name
        years_exp = profile.years_of_experience
        skills_list = profile.skills.technical[:15]
        education_list = profile.education
        if education_list:
            edu = education_list[0]
            education_str = edu.degree if hasattr(edu, 'degree') else edu.get("degree", "")
        else:
            education_str = "Not specified"
        target_roles_list = profile.target_roles
    
    # Aggregate missing skills from all matches
    all_missing_skills = []
    for match in job_matches:
        all_missing_skills.extend(match.missing_skills)
    
    # Count frequency
    from collections import Counter
    skill_counts = Counter(all_missing_skills)
    top_missing = [skill for skill, _ in skill_counts.most_common(10)]
    
    # Format top jobs for prompt
    top_jobs_text = ""
    for i, match in enumerate(top_matches[:5], 1):
        top_jobs_text += f"""
{i}. {match.title} at {match.company}
   Match Score: {match.overall_score * 100:.0f}%
   Matching Skills: {', '.join(match.matching_skills[:5])}
   Missing Skills: {', '.join(match.missing_skills[:5])}
"""
    
    # Calculate average score
    avg_score = sum(m.overall_score for m in job_matches) / len(job_matches) * 100 if job_matches else 0
    
    try:
        chain = CAREER_GUIDANCE_PROMPT | llm
        response = chain.invoke({
            "name": contact_name,
            "years_exp": years_exp,
            "skills": ", ".join(skills_list),
            "education": education_str,
            "target_roles": ", ".join(target_roles_list),
            "total_jobs": len(job_matches),
            "avg_score": f"{avg_score:.0f}",
            "top_jobs": top_jobs_text,
            "missing_skills": ", ".join(top_missing),
        })
        
        content = response.content.strip()
        
        # Extract JSON - try multiple methods
        import re
        
        # Method 1: Direct parse
        try:
            guidance_data = json.loads(content)
        except json.JSONDecodeError:
            # Method 2: Extract from markdown code block
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            # Method 3: Find JSON object with regex
            if not content.startswith("{"):
                json_match = re.search(r'\{[\s\S]*\}', content)
                if json_match:
                    content = json_match.group()
            
            guidance_data = json.loads(content)
        
        guidance = CareerGuidance(
            skill_gaps=guidance_data.get("skill_gaps", top_missing),
            learning_recommendations=guidance_data.get("learning_recommendations", []),
            resume_improvements=guidance_data.get("resume_improvements", []),
            career_paths=guidance_data.get("career_paths", []),
            interview_tips=guidance_data.get("interview_tips", []),
            salary_insights=guidance_data.get("salary_insights", ""),
        )
        
        state["career_guidance"] = guidance
        
    except Exception as e:
        state["errors"] = state.get("errors", []) + [f"Career guidance failed: {str(e)}"]
        state["career_guidance"] = CareerGuidance(skill_gaps=top_missing)
    
    state["current_step"] = "guidance_generated"
    return state
