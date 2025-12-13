"""Job Search Agent - Generates smart queries and searches jobs"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from ..config import OPENAI_API_KEY, OPENAI_CHAT_MODEL
from .state import AgentState

# Import JobSpy
from jobspy import scrape_jobs


llm = ChatOpenAI(api_key=OPENAI_API_KEY, model=OPENAI_CHAT_MODEL, temperature=0.3)


QUERY_GENERATION_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a job search expert. Given a candidate's profile, generate optimal search queries.

Create 3-5 search queries that will find the best matching jobs. Consider:
- Their target roles
- Technical skills (use industry-standard terms)
- Experience level (junior/mid/senior)
- Any specializations

Return ONLY a JSON array of search query strings. Example:
["senior python developer", "backend engineer python", "software engineer AWS"]"""),
    ("human", """Profile:
- Target roles: {target_roles}
- Technical skills: {technical_skills}
- Tools: {tools}
- Years of experience: {years_exp}
- Summary: {summary}""")
])


def generate_search_queries(state: AgentState) -> AgentState:
    """Generate smart job search queries from resume profile"""
    profile = state.get("resume_profile")
    
    if not profile:
        state["search_queries"] = ["software engineer"]  # Fallback
        return state
    
    chain = QUERY_GENERATION_PROMPT | llm
    
    try:
        import json
        response = chain.invoke({
            "target_roles": ", ".join(profile.target_roles) if profile.target_roles else "software developer",
            "technical_skills": ", ".join(profile.skills.technical[:10]) if profile.skills.technical else "",
            "tools": ", ".join(profile.skills.tools[:10]) if profile.skills.tools else "",
            "years_exp": profile.years_of_experience,
            "summary": profile.summary[:500] if profile.summary else "",
        })
        
        content = response.content
        # Extract JSON array
        if "[" in content:
            start = content.index("[")
            end = content.rindex("]") + 1
            queries = json.loads(content[start:end])
            state["search_queries"] = queries[:5]  # Max 5 queries
        else:
            state["search_queries"] = profile.target_roles[:3] if profile.target_roles else ["software engineer"]
            
    except Exception as e:
        state["errors"] = state.get("errors", []) + [f"Query generation failed: {str(e)}"]
        state["search_queries"] = profile.target_roles[:3] if profile.target_roles else ["software engineer"]
    
    state["current_step"] = "queries_generated"
    return state


def search_jobs(state: AgentState) -> AgentState:
    """Search jobs using JobSpy with generated queries"""
    queries = state.get("search_queries", ["software engineer"])
    preferences = state.get("search_preferences", {})
    profile = state.get("resume_profile")
    
    location = preferences.get("location", "") or preferences.get("desired_location", "") or preferences.get("current_location", "")
    if not location and profile and profile.preferred_locations:
        location = profile.preferred_locations[0]
    if not location:
        location = "United States"  # Default fallback
    
    all_jobs = []
    seen_ids = set()
    
    is_remote = preferences.get("is_remote", False)
    print(f"   [3/6] Searching jobs with {len(queries)} queries...")
    print(f"         Location: '{location}', Remote: {is_remote}")
    
    # Detect country from location
    location_lower = location.lower()
    if "india" in location_lower:
        country = "India"
    elif "uk" in location_lower or "united kingdom" in location_lower or "london" in location_lower:
        country = "UK"
    elif "canada" in location_lower:
        country = "Canada"
    elif "australia" in location_lower:
        country = "Australia"
    elif "germany" in location_lower:
        country = "Germany"
    else:
        country = "USA"
    
    print(f"         Country detected: {country}")
    
    for i, query in enumerate(queries[:3]):  # Limit to 3 queries for speed
        print(f"         Query {i+1}: '{query}'")
        try:
            jobs_df = scrape_jobs(
                site_name=["indeed", "linkedin"],
                search_term=query,
                location=location,
                results_wanted=15,
                hours_old=72,
                country_indeed=country,
            )
            
            print(f"         Found {len(jobs_df)} jobs for query '{query}'")
            
            # Convert to list of dicts
            for _, row in jobs_df.iterrows():
                job_id = str(row.get("id", ""))
                if job_id and job_id not in seen_ids:
                    seen_ids.add(job_id)
                    all_jobs.append(row.to_dict())
                    
        except Exception as e:
            print(f"         ERROR: {str(e)}")
            state["errors"] = state.get("errors", []) + [f"Search failed for '{query}': {str(e)}"]
    
    state["jobs_found"] = all_jobs
    state["current_step"] = "jobs_searched"
    
    return state
