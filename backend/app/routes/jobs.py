from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional
from app.services.job_matcher import fetch_and_score_jobs

router = APIRouter(prefix="/jobs", tags=["Jobs"])


class JobSearchBody(BaseModel):
    skills: Optional[List[str]] = None
    resume_text: Optional[str] = None


@router.get("/")
def get_jobs(skills: Optional[List[str]] = Query(None)):
    """GET: Simple skill-based search (fallback)."""
    jobs = fetch_and_score_jobs(resume_skills=skills)
    return {"jobs": jobs}


@router.post("/")
def search_jobs(body: JobSearchBody):
    """POST: Advanced matching with resume text for semantic similarity."""
    jobs = fetch_and_score_jobs(
        resume_skills=body.skills,
        resume_text=body.resume_text,
    )
    return {"jobs": jobs}