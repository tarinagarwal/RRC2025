"""
AI Job Matcher - Main Entry Point

Usage:
    python -m ai_job_matcher.main --resume path/to/resume.pdf --location "New York" --remote
"""
import argparse
import json
from pathlib import Path

from .workflow import JobMatcherPipeline


def main():
    parser = argparse.ArgumentParser(description="AI-Powered Job Matcher")
    parser.add_argument("--resume", "-r", required=True, help="Path to resume PDF")
    parser.add_argument("--location", "-l", default="", help="Preferred job location")
    parser.add_argument("--remote", action="store_true", help="Search for remote jobs")
    parser.add_argument("--salary", "-s", type=int, default=0, help="Minimum salary")
    parser.add_argument("--output", "-o", default="results.json", help="Output JSON file")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    
    args = parser.parse_args()
    
    # Validate resume path
    resume_path = Path(args.resume)
    if not resume_path.exists():
        print(f"❌ Resume not found: {resume_path}")
        return
    
    print("🚀 Starting AI Job Matcher...")
    print(f"📄 Resume: {resume_path}")
    print(f"📍 Location: {args.location or 'Any'}")
    print(f"🏠 Remote: {'Yes' if args.remote else 'No'}")
    print()
    
    # Run pipeline
    pipeline = JobMatcherPipeline()
    
    print("⏳ Processing... (this may take a few minutes)")
    print("   [1/6] Parsing resume...")
    
    result = pipeline.run(
        resume_path=str(resume_path),
        location=args.location,
        remote=args.remote,
        min_salary=args.salary,
    )
    
    # Print summary
    summary = pipeline.get_summary(result)
    print(summary)
    
    # Save detailed results
    output_data = {
        "profile": result["resume_profile"].model_dump() if result.get("resume_profile") else None,
        "search_queries": result.get("search_queries", []),
        "total_jobs_found": len(result.get("jobs_found", [])),
        "top_matches": [m.model_dump() for m in result.get("top_matches", [])],
        "career_guidance": result["career_guidance"].model_dump() if result.get("career_guidance") else None,
        "errors": result.get("errors", []),
    }
    
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, default=str)
    
    print(f"\n✅ Detailed results saved to: {args.output}")


if __name__ == "__main__":
    main()
