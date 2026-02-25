from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ai_service import generate_cover_letter

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