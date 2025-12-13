"""Resume Parser Agent - Extracts and structures resume data"""
import sys
from pathlib import Path

# Add parent paths for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from ..config import OPENAI_API_KEY, OPENAI_CHAT_MODEL
from ..models import ResumeProfile
from .state import AgentState


# Import the existing resume parser (direct file import to avoid conflicts)
import importlib.util
_groq_parser_path = Path(__file__).parent.parent.parent / "resume-parser" / "groq_parser.py"
_spec = importlib.util.spec_from_file_location("groq_parser", _groq_parser_path)
_groq_parser = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_groq_parser)
detect_contact_info = _groq_parser.detect_contact_info


llm = ChatOpenAI(api_key=OPENAI_API_KEY, model=OPENAI_CHAT_MODEL, temperature=0)


PROFILE_ENHANCEMENT_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are an expert resume analyst. Given parsed resume data, enhance it with:
1. Estimate years of experience from work history
2. Suggest target job roles based on skills and experience
3. Identify if candidate prefers remote work (from any mentions)
4. Extract preferred locations

Return a JSON with these additional fields:
- years_of_experience: int
- target_roles: list of 3-5 job titles they'd be good for
- preferred_locations: list of locations mentioned or inferred
- is_remote_preferred: bool"""),
    ("human", "Resume data:\n{resume_data}")
])


def parse_resume(state: AgentState) -> AgentState:
    """Parse resume PDF and extract structured data"""
    resume_path = state.get("resume_path", "")
    
    if not resume_path or not Path(resume_path).exists():
        state["errors"] = state.get("errors", []) + ["Resume file not found"]
        state["current_step"] = "error"
        return state
    
    # Use existing Groq-based parser
    raw_data = detect_contact_info(resume_path)
    
    if "error" in raw_data:
        state["errors"] = state.get("errors", []) + [raw_data["error"]]
        state["current_step"] = "error"
        return state
    
    state["resume_raw"] = raw_data
    state["current_step"] = "resume_parsed"
    
    return state


def enhance_profile(state: AgentState) -> AgentState:
    """Enhance resume profile with AI analysis"""
    raw_data = state.get("resume_raw", {})
    
    if not raw_data:
        return state
    
    # Use LLM to enhance profile
    chain = PROFILE_ENHANCEMENT_PROMPT | llm
    
    try:
        import json
        response = chain.invoke({"resume_data": json.dumps(raw_data, indent=2)})
        
        # Parse LLM response
        content = response.content
        # Extract JSON from response
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
        
        enhancements = json.loads(content)
        
        # Build ResumeProfile
        contact_data = raw_data.get("contact", {})
        skills_data = raw_data.get("skills", {})
        
        profile = ResumeProfile(
            contact={
                "name": contact_data.get("name", ""),
                "phone": contact_data.get("phone", ""),
                "email": contact_data.get("email", ""),
                "address": contact_data.get("address", ""),
                "linkedin": contact_data.get("socials", {}).get("linkedin", ""),
                "github": contact_data.get("socials", {}).get("github", ""),
                "portfolio": contact_data.get("socials", {}).get("portfolio", ""),
            },
            summary=raw_data.get("summary", ""),
            education=raw_data.get("education", []),
            skills={
                "technical": skills_data.get("technical", []),
                "soft": skills_data.get("soft", []),
                "tools": skills_data.get("tools", []),
                "languages": skills_data.get("languages", []),
            },
            experience=raw_data.get("experience", []),
            projects=raw_data.get("projects", []),
            certifications=raw_data.get("certifications", []),
            years_of_experience=enhancements.get("years_of_experience", 0),
            target_roles=enhancements.get("target_roles", []),
            preferred_locations=enhancements.get("preferred_locations", []),
            is_remote_preferred=enhancements.get("is_remote_preferred", False),
        )
        
        state["resume_profile"] = profile
        state["current_step"] = "profile_enhanced"
        
    except Exception as e:
        state["errors"] = state.get("errors", []) + [f"Profile enhancement failed: {str(e)}"]
        # Still create basic profile
        state["resume_profile"] = ResumeProfile(**raw_data)
    
    return state
