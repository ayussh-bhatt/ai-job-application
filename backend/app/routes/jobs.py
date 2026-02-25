from fastapi import APIRouter, Query
from typing import List, Optional
from app.services.job_service import fetch_jobs

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("/")
def get_jobs(skills: Optional[List[str]] = Query(None)):
    return {"jobs": fetch_jobs(skills)}