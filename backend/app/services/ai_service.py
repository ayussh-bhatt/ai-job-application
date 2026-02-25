import os
import google.generativeai as genai
from dotenv import load_dotenv
load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash-lite")

def generate_cover_letter(job_title, company, skills):
    prompt = f"""
    You are an expert career coach and professional resume writer.

    Write a concise, professional cover letter for a {job_title} position at {company}.

    Candidate Skills:
    {", ".join(skills)}

    Guidelines:
    - Use a formal and professional tone.
    - Keep it between 120–160 words.
    - Highlight the most relevant skills and strengths.
    - Show enthusiasm for the role and company.
    - Focus on value the candidate brings.
    - Avoid clichés and generic phrases.
    - Do NOT include placeholders.
    - Do NOT exaggerate or fabricate experience.
    - End with a professional closing.

    Return only the cover letter.
    """

    response = model.generate_content(prompt)
    return response.text

def generate_followup_email(job_title, company):
    prompt = f"""
    Write a professional follow-up email for a candidate who applied for the
    {job_title} position at {company}.

    Guidelines:
    - professional and polite tone
    - express continued interest
    - concise (under 120 words)
    - suitable for sending 1 week after applying
    """

    response = model.generate_content(prompt)
    return response.text