"""LangGraph Workflow - Orchestrates the entire job matching pipeline"""
from langgraph.graph import StateGraph, END

from .agents.state import AgentState
from .agents.resume_agent import parse_resume, enhance_profile
from .agents.job_search_agent import generate_search_queries, search_jobs
from .agents.scoring_agent import score_jobs
from .agents.career_coach_agent import generate_career_guidance


def should_continue(state: AgentState) -> str:
    """Determine next step based on current state"""
    if state.get("errors") and len(state["errors"]) > 3:
        return "error"
    return "continue"


def create_workflow() -> StateGraph:
    """Create the LangGraph workflow for job matching"""
    
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("parse_resume", parse_resume)
    workflow.add_node("enhance_profile", enhance_profile)
    workflow.add_node("generate_queries", generate_search_queries)
    workflow.add_node("search_jobs", search_jobs)
    workflow.add_node("score_jobs", score_jobs)
    workflow.add_node("career_guidance", generate_career_guidance)
    
    # Define edges (linear flow for now)
    workflow.set_entry_point("parse_resume")
    
    workflow.add_edge("parse_resume", "enhance_profile")
    workflow.add_edge("enhance_profile", "generate_queries")
    workflow.add_edge("generate_queries", "search_jobs")
    workflow.add_edge("search_jobs", "score_jobs")
    workflow.add_edge("score_jobs", "career_guidance")
    workflow.add_edge("career_guidance", END)
    
    return workflow.compile()


class JobMatcherPipeline:
    """Main interface for the AI Job Matcher"""
    
    def __init__(self):
        self.workflow = create_workflow()
    
    def run(
        self,
        resume_path: str,
        location: str = "",
        remote: bool = False,
        min_salary: int = 0,
    ) -> dict:
        """
        Run the complete job matching pipeline.
        
        Args:
            resume_path: Path to resume PDF
            location: Preferred job location
            remote: Whether to search for remote jobs
            min_salary: Minimum salary expectation
            
        Returns:
            Complete results including matches and guidance
        """
        initial_state = {
            "resume_path": resume_path,
            "search_preferences": {
                "location": location,
                "remote": remote,
                "min_salary": min_salary,
            },
            "resume_raw": {},
            "resume_profile": None,
            "search_queries": [],
            "jobs_found": [],
            "job_matches": [],
            "top_matches": [],
            "career_guidance": None,
            "messages": [],
            "current_step": "starting",
            "errors": [],
        }
        
        # Run workflow
        result = self.workflow.invoke(initial_state)
        
        return result
    
    def get_summary(self, result: dict) -> str:
        """Generate a human-readable summary of results"""
        profile = result.get("resume_profile")
        top_matches = result.get("top_matches", [])
        guidance = result.get("career_guidance")
        
        summary = []
        summary.append("=" * 60)
        summary.append("🎯 AI JOB MATCHER - RESULTS SUMMARY")
        summary.append("=" * 60)
        
        if profile:
            summary.append(f"\n👤 CANDIDATE: {profile.contact.name}")
            summary.append(f"📊 Experience: {profile.years_of_experience} years")
            summary.append(f"🎯 Target Roles: {', '.join(profile.target_roles[:3])}")
        
        summary.append(f"\n📋 JOBS ANALYZED: {len(result.get('job_matches', []))}")
        
        if top_matches:
            summary.append("\n🏆 TOP 5 MATCHES:")
            summary.append("-" * 40)
            for i, match in enumerate(top_matches[:5], 1):
                score_bar = "█" * int(match.overall_score * 10) + "░" * (10 - int(match.overall_score * 10))
                summary.append(f"\n{i}. {match.title}")
                summary.append(f"   🏢 {match.company}")
                summary.append(f"   📍 {match.location}")
                summary.append(f"   📊 Match: [{score_bar}] {match.overall_score * 100:.0f}%")
                if match.matching_skills:
                    summary.append(f"   ✅ Skills: {', '.join(match.matching_skills[:3])}")
                if match.missing_skills:
                    summary.append(f"   ❌ Gaps: {', '.join(match.missing_skills[:3])}")
        
        if guidance:
            summary.append("\n" + "=" * 60)
            summary.append("💡 CAREER GUIDANCE")
            summary.append("=" * 60)
            
            if guidance.skill_gaps:
                summary.append(f"\n🔧 Skill Gaps to Address:")
                for skill in guidance.skill_gaps[:5]:
                    summary.append(f"   • {skill}")
            
            if guidance.resume_improvements:
                summary.append(f"\n📝 Resume Improvements:")
                for tip in guidance.resume_improvements[:3]:
                    summary.append(f"   • {tip}")
            
            if guidance.career_paths:
                summary.append(f"\n🛤️ Career Paths to Consider:")
                for path in guidance.career_paths[:3]:
                    summary.append(f"   • {path}")
            
            if guidance.salary_insights:
                summary.append(f"\n💰 Salary Insights:")
                summary.append(f"   {guidance.salary_insights}")
        
        if result.get("errors"):
            summary.append(f"\n⚠️ Warnings: {len(result['errors'])} issues encountered")
        
        summary.append("\n" + "=" * 60)
        
        return "\n".join(summary)
