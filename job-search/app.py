"""Flask Backend with WebSocket for real-time updates"""
import os
import json
import threading
from pathlib import Path
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__, template_folder='frontend', static_folder='frontend/static')
app.config['SECRET_KEY'] = 'jobspy-secret-key'
socketio = SocketIO(app, cors_allowed_origins="*")

# Store current job state
current_state = {
    "status": "idle",
    "step": "",
    "progress": 0,
    "message": "",
    "results": None
}


def emit_progress(step: str, progress: int, message: str, data: dict = None):
    """Emit progress update to all connected clients"""
    current_state["step"] = step
    current_state["progress"] = progress
    current_state["message"] = message
    if data:
        current_state["results"] = data
    socketio.emit('progress', {
        "step": step,
        "progress": progress,
        "message": message,
        "data": data
    })


def run_job_matcher(resume_path: str, current_location: str, desired_location: str, search_location: str, is_remote: bool):
    """Run the job matcher pipeline with progress updates"""
    import sys
    import time
    import traceback
    sys.path.insert(0, str(Path(__file__).parent))
    
    print(f"[DEBUG] Starting job matcher: resume={resume_path}, location={search_location}, remote={is_remote}")
    
    from ai_job_matcher.agents.state import AgentState
    from ai_job_matcher.agents.resume_agent import parse_resume, enhance_profile
    from ai_job_matcher.agents.job_search_agent import generate_search_queries, search_jobs
    from ai_job_matcher.agents.scoring_agent import score_jobs
    from ai_job_matcher.agents.career_coach_agent import generate_career_guidance
    
    current_state["status"] = "running"
    
    try:
        # Initialize state
        emit_progress("init", 5, "Initializing AI Job Matcher...")
        time.sleep(0.3)
        
        state: AgentState = {
            "resume_path": resume_path,
            "search_preferences": {
                "location": search_location,
                "current_location": current_location,
                "desired_location": desired_location,
                "is_remote": is_remote,
                "results_wanted": 15,
            },
            "resume_raw": {},
            "resume_profile": None,
            "search_queries": [],
            "jobs_found": [],
            "job_matches": [],
            "top_matches": [],
            "career_guidance": None,
            "messages": [],
            "current_step": "start",
            "errors": [],
        }
        
        # Step 1: Parse Resume
        emit_progress("resume", 15, "Parsing your resume with AI vision...")
        state = parse_resume(state)
        
        if state.get("errors"):
            emit_progress("error", 0, f"Resume parsing failed: {state['errors'][-1]}")
            return
        
        emit_progress("resume_parsed", 25, "Resume parsed! Enhancing profile...")
        state = enhance_profile(state)
        emit_progress("profile_enhanced", 35, "Profile enhanced with AI analysis!")
        
        # Step 2: Generate Search Queries
        emit_progress("queries_generated", 45, "Generating smart search queries...")
        state = generate_search_queries(state)
        queries = state.get("search_queries", [])
        emit_progress("queries_generated", 50, f"Generated {len(queries)} search queries!")
        
        # Step 3: Search Jobs
        emit_progress("jobs_searched", 55, "Searching Indeed & LinkedIn...")
        state = search_jobs(state)
        jobs_count = len(state.get("jobs_found", []))
        emit_progress("jobs_searched", 65, f"Found {jobs_count} jobs! Now scoring...")
        
        # Step 4: Score Jobs
        emit_progress("jobs_scored", 70, f"Scoring {jobs_count} jobs against your profile...")
        state = score_jobs(state)
        emit_progress("jobs_scored", 85, "Jobs scored! Generating career guidance...")
        
        # Step 5: Career Guidance
        emit_progress("guidance_generated", 90, "AI is generating personalized career guidance...")
        state = generate_career_guidance(state)
        emit_progress("guidance_generated", 95, "Career guidance ready!")
        
        result = state
        
        # Format results
        profile = result.get("resume_profile")
        if profile:
            if hasattr(profile, 'model_dump'):
                profile_data = profile.model_dump()
            elif hasattr(profile, 'dict'):
                profile_data = profile.dict()
            else:
                profile_data = dict(profile) if isinstance(profile, dict) else {}
        else:
            profile_data = {}
        
        job_matches = result.get("job_matches", [])
        matches_data = []
        for m in job_matches:
            if hasattr(m, 'model_dump'):
                matches_data.append(m.model_dump())
            elif hasattr(m, 'dict'):
                matches_data.append(m.dict())
            else:
                matches_data.append(dict(m))
        
        guidance = result.get("career_guidance")
        if guidance:
            if hasattr(guidance, 'model_dump'):
                guidance_data = guidance.model_dump()
            elif hasattr(guidance, 'dict'):
                guidance_data = guidance.dict()
            else:
                guidance_data = dict(guidance) if isinstance(guidance, dict) else {}
        else:
            guidance_data = {}
        
        final_results = {
            "profile": profile_data,
            "search_queries": result.get("search_queries", []),
            "total_jobs": len(job_matches),
            "top_matches": matches_data[:10],
            "all_matches": matches_data,
            "career_guidance": guidance_data,
            "errors": result.get("errors", [])
        }
        
        emit_progress("complete", 100, "Analysis complete!", final_results)
        current_state["status"] = "complete"
        
    except Exception as e:
        print(f"[ERROR] Job matcher failed: {str(e)}")
        traceback.print_exc()
        emit_progress("error", 0, f"Error: {str(e)}")
        current_state["status"] = "error"


class ProgressCallback:
    """Callback to emit progress during workflow execution"""
    def __init__(self, sio):
        self.sio = sio
        self.step_progress = {
            "resume_parsed": (25, "Resume parsed successfully!"),
            "profile_enhanced": (35, "Profile enhanced with AI analysis..."),
            "queries_generated": (45, "Search queries generated..."),
            "jobs_searched": (60, "Jobs found! Now scoring..."),
            "jobs_scored": (85, "Jobs scored! Generating guidance..."),
            "guidance_generated": (95, "Career guidance ready!")
        }
    
    def on_chain_end(self, *args, **kwargs):
        pass


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/upload', methods=['POST'])
def upload_resume():
    """Upload a resume file"""
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if file and file.filename.endswith('.pdf'):
        # Save to uploads folder
        uploads_dir = Path('uploads')
        uploads_dir.mkdir(exist_ok=True)
        
        filepath = uploads_dir / 'resume.pdf'
        file.save(filepath)
        
        return jsonify({"path": str(filepath), "filename": file.filename})
    
    return jsonify({"error": "Invalid file type"}), 400


@app.route('/api/start', methods=['POST'])
def start_analysis():
    """Start the job matching analysis"""
    data = request.json
    resume_path = data.get('resume_path', 'resume-parser/resume.pdf')
    current_location = data.get('current_location', '')
    desired_location = data.get('desired_location', '')
    is_remote = data.get('is_remote', True)
    
    # Build search location - prioritize desired location, fallback to current
    search_location = desired_location or current_location or 'United States'
    
    # Check if resume exists
    if not Path(resume_path).exists():
        return jsonify({"error": f"Resume not found: {resume_path}"}), 400
    
    # Run in background thread
    thread = threading.Thread(
        target=run_job_matcher,
        args=(resume_path, current_location, desired_location, search_location, is_remote)
    )
    thread.daemon = True
    thread.start()
    
    return jsonify({"status": "started"})


@app.route('/api/status')
def get_status():
    """Get current status"""
    return jsonify(current_state)


@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('connected', {'status': 'connected'})


@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')


if __name__ == '__main__':
    # Create frontend directories
    Path('frontend/static/css').mkdir(parents=True, exist_ok=True)
    Path('frontend/static/js').mkdir(parents=True, exist_ok=True)
    
    print("\n" + "="*60)
    print("🎯 AI JOB MATCHER - Web Interface")
    print("="*60)
    print("Open http://localhost:5000 in your browser")
    print("="*60 + "\n")
    
    socketio.run(app, debug=True, port=5000)
