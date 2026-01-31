from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()  
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase configuration
url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

class SessionData(BaseModel):
    access_code: str
    exercise_name: str
    rep_count: int
    target_reps: int
    duration_seconds: int
    average_quality: float
    rpe: int
    video_url: Optional[str] = None
    metrics: Optional[dict] = None

@app.get("/api/program/{access_code}")
async def get_program(access_code: str):
    """Fetch exercise program details by access code."""
    try:
        response = supabase.table("exercise_programs").select("*").eq("access_code", access_code).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Program not found")
        
        # Update last_accessed
        supabase.table("exercise_programs").update({"last_accessed": "now()"}).eq("access_code", access_code).execute()

        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sessions")
async def create_session(data: SessionData):
    """Receive and store session results from tracking script."""
    try:
        # Find program by access code to get program_id
        program_res = supabase.table("exercise_programs").select("id").eq("access_code", data.access_code).single().execute()
        if not program_res.data:
            raise HTTPException(status_code=404, detail="Invalid access code")
        
        program_id = program_res.data["id"]
        
        session_payload = {
            "program_id": program_id,
            "access_code": data.access_code,
            "exercise_name": data.exercise_name,
            "rep_count": data.rep_count,
            "target_reps": data.target_reps,
            "completion_percentage": (data.rep_count / data.target_reps * 100) if data.target_reps > 0 else 0,
            "average_rom": data.metrics.get("average_rom") if data.metrics else None,
            "max_rom": data.metrics.get("max_rom") if data.metrics else None,
            "stress_score": data.metrics.get("average_stress") if data.metrics else None,
            "video_url": data.video_url,
            "notes": f"RPE: {data.rpe}",
            "metrics": data.metrics,
            "completed_at": "now()"
        }
        
        response = supabase.table("exercise_sessions").insert(session_payload).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to save session")
        
        return {"status": "success", "session_id": response.data[0]["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sessions/{program_id}")
async def get_sessions(program_id: str):
    """Fetch session history for a specific program."""
    try:
        response = supabase.table("exercise_sessions").select("*").eq("program_id", program_id).order("completed_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)