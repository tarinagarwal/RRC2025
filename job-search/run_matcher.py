"""
Quick runner for AI Job Matcher

Just run: python run_matcher.py
"""
import os
import sys
from pathlib import Path

# Add project to path
sys.path.insert(0, str(Path(__file__).parent))

from ai_job_matcher.workflow import JobMatcherPipeline
import json


def run():
    # Configuration
    RESUME_PATH = "resume-parser/resume.pdf"  # Your resume
    LOCATION = "United States"  # Or specific city like "San Francisco, CA"
    REMOTE = True  # Search for remote jobs
    MIN_SALARY = 0  # Minimum salary (0 = any)
    
    # Check for OpenAI API key
    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️  OPENAI_API_KEY not set!")
        print("   Set it in .env file or run:")
        print("   set OPENAI_API_KEY=sk-your-key-here")
        print()
        api_key = input("Enter your OpenAI API key (or press Enter to skip): ").strip()
        if api_key:
            os.environ["OPENAI_API_KEY"] = api_key
        else:
            print("❌ Cannot proceed without OpenAI API key")
            return
    
    # Validate resume
    if not Path(RESUME_PATH).exists():
        print(f"❌ Resume not found: {RESUME_PATH}")
        print("   Please update RESUME_PATH in this script")
        return
    
    print("=" * 60)
    print("🎯 AI JOB MATCHER")
    print("=" * 60)
    print(f"📄 Resume: {RESUME_PATH}")
    print(f"📍 Location: {LOCATION}")
    print(f"🏠 Remote: {'Yes' if REMOTE else 'No'}")
    print("=" * 60)
    print()
    
    # Run the pipeline
    pipeline = JobMatcherPipeline()
    
    print("⏳ Running AI Job Matcher Pipeline...")
    print("   This will:")
    print("   1. Parse your resume")
    print("   2. Generate smart search queries")
    print("   3. Search Indeed & LinkedIn")
    print("   4. Score jobs against your profile")
    print("   5. Generate career guidance")
    print()
    
    result = pipeline.run(
        resume_path=RESUME_PATH,
        location=LOCATION,
        remote=REMOTE,
        min_salary=MIN_SALARY,
    )
    
    # Print summary
    summary = pipeline.get_summary(result)
    print(summary)
    
    # Save results
    output_file = "job_match_results.json"
    output_data = {
        "profile": result["resume_profile"].model_dump() if result.get("resume_profile") else None,
        "search_queries": result.get("search_queries", []),
        "total_jobs_found": len(result.get("jobs_found", [])),
        "top_matches": [m.model_dump() for m in result.get("top_matches", [])],
        "all_matches": [m.model_dump() for m in result.get("job_matches", [])],
        "career_guidance": result["career_guidance"].model_dump() if result.get("career_guidance") else None,
        "errors": result.get("errors", []),
    }
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, default=str)
    
    print(f"\n✅ Full results saved to: {output_file}")
    print("\n💡 Tip: Open the JSON file to see all job matches and detailed guidance!")


if __name__ == "__main__":
    run()
