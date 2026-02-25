from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ai_service import generate_cover_letter
from app.services.ai_service import generate_followup_email

router = APIRouter(prefix="/ai", tags=["AI"])

class CoverLetterRequest(BaseModel):
    job_title: str
    company: str
    skills: list[str]

@router.post("/cover-letter")
def cover_letter(data: CoverLetterRequest):
    letter = generate_cover_letter(
        data.job_title,
        data.company,
        data.skills
    )
    return {"cover_letter": letter}

@router.post("/follow-up")
def follow_up(data: CoverLetterRequest):
    email = generate_followup_email(
        data.job_title,
        data.company
    )
    return {"email": email}