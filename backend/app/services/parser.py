import pdfplumber
from docx import Document
import io
from app.services.skill_extractor import extract_skills

def parse_resume(file_bytes, filename):
    text = ""

    if filename.endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""

    elif filename.endswith(".docx"):
        doc = Document(io.BytesIO(file_bytes))
        for para in doc.paragraphs:
            text += para.text + "\n"

    skills = extract_skills(text)

    return {
        "skills": skills,
        "preview": text[:500]
    }