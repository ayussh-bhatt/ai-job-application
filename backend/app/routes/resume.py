from fastapi import APIRouter, UploadFile, File
from app.services.parser import parse_resume

router = APIRouter(prefix="/resume", tags=["Resume"])

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    content = await file.read()
    data = parse_resume(content, file.filename)
    return {"extracted_data": data}