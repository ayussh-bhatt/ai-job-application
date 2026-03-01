"""
Advanced job matching using:
- Skill Match (40%)
- Semantic Similarity (30%)
- Title Similarity (20%)
- Experience Match (10%)
"""
import re
import requests
from typing import List, Optional, Tuple
from app.services.job_service import expand_skills, SKILL_SYNONYMS

REMOTEOK_API = "https://remoteok.com/api"
TOP_JOBS_COUNT = 3  # Highlight top N jobs


def _get_embedding_model():
    """Lazy load sentence-transformers to avoid slow startup."""
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer("all-MiniLM-L6-v2")


def _cosine_similarity(vec1, vec2) -> float:
    import numpy as np
    dot = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(dot / (norm1 * norm2))


def _to_percentage(score: float) -> float:
    """Convert similarity score [0,1] to percentage [0,100]."""
    return round(min(100, max(0, score * 100)), 1)


def _extract_job_skills(job: dict) -> List[str]:
    """Extract skills from job tags and description."""
    skills = set()
    tags = job.get("tags") or []
    for tag in tags:
        if isinstance(tag, str) and len(tag) > 1:
            skills.add(tag.lower())

    desc = (job.get("description") or "").lower()
    for skill, synonyms in SKILL_SYNONYMS.items():
        if skill in desc:
            skills.add(skill)
        for syn in synonyms:
            if syn in desc:
                skills.add(skill)
                break

    return list(skills)


def _calc_skill_match(resume_skills: List[str], job_skills: List[str]) -> Tuple[float, List[str]]:
    """
    skill_score = matched_skills / total_job_skills
    Returns (score 0-1, missing_skills)
    """
    if not job_skills:
        return 1.0, []

    expanded_resume = expand_skills(resume_skills)
    job_skills_lower = [s.lower() for s in job_skills]
    matched = sum(1 for js in job_skills_lower if js in expanded_resume)
    missing = [s for s in job_skills_lower if s not in expanded_resume]
    score = matched / len(job_skills_lower)
    return min(1.0, score), missing


def _calc_semantic_similarity(resume_text: str, job_description: str, model) -> float:
    """Cosine similarity between resume and job description embeddings."""
    if not resume_text.strip() or not job_description.strip():
        return 0.0
    desc_clean = re.sub(r"<[^>]+>", " ", job_description)[:4000]
    texts = [resume_text[:4000], desc_clean]
    embeddings = model.encode(texts)
    sim = _cosine_similarity(embeddings[0], embeddings[1])
    return max(0, min(1, sim))


def _calc_title_similarity(resume_text: str, job_title: str, model) -> float:
    """Similarity between resume context and job title."""
    if not resume_text.strip() or not job_title.strip():
        return 0.0
    resume_snippet = resume_text[:1500]
    texts = [resume_snippet, job_title]
    embeddings = model.encode(texts)
    sim = _cosine_similarity(embeddings[0], embeddings[1])
    return max(0, min(1, sim))


def _calc_experience_match(resume_text: str, job_description: str) -> float:
    """
    Simple heuristic: check for experience-related keywords.
    Returns 0-1 score.
    """
    resume_lower = resume_text.lower()
    desc_lower = (job_description or "").lower()
    keywords = ["experience", "years", "proficient", "skilled", "expertise"]
    resume_has = sum(1 for k in keywords if k in resume_lower)
    desc_has = sum(1 for k in keywords if k in desc_lower)
    if desc_has == 0:
        return 0.5
    match = min(resume_has / max(desc_has, 1), 1.0)
    return match


def fetch_and_score_jobs(
    resume_skills: Optional[List[str]] = None,
    resume_text: Optional[str] = None,
) -> List[dict]:
    """
    Fetch jobs from RemoteOK and score them using the advanced formula:
    Final = 0.40 * Skill Match + 0.30 * Semantic + 0.20 * Title + 0.10 * Experience
    """
    try:
        response = requests.get(REMOTEOK_API, headers={"User-Agent": "Mozilla/5.0"})
        data = response.json()
    except Exception as e:
        return [{"_error": str(e), "title": "", "company": ""}]

    jobs_raw = [j for j in data[1:50] if isinstance(j, dict) and j.get("id")]

    use_advanced = resume_text and resume_skills
    model = None
    if use_advanced:
        try:
            model = _get_embedding_model()
        except Exception:
            use_advanced = False

    resume_text = resume_text or ""
    resume_skills = resume_skills or []

    results = []
    for job in jobs_raw:
        title = job.get("position") or "Unknown"
        company = job.get("company") or ""
        description = job.get("description") or ""
        tags = job.get("tags") or []
        url = job.get("url") or ""

        job_skills = _extract_job_skills(job)

        if use_advanced and model:
            skill_score, missing_skills = _calc_skill_match(resume_skills, job_skills)
            sem_sim = _calc_semantic_similarity(resume_text, description, model)
            title_sim = _calc_title_similarity(resume_text, title, model)
            exp_match = _calc_experience_match(resume_text, description)

            final = (
                0.40 * skill_score
                + 0.30 * sem_sim
                + 0.20 * title_sim
                + 0.10 * exp_match
            )
            match_score = _to_percentage(final)
            missing_skills_list = missing_skills[:5]
        else:
            expanded = expand_skills(resume_skills)
            job_tags = [t.lower() for t in tags if isinstance(t, str)]
            score = sum(1 for s in expanded if s in job_tags)
            if score >= 3:
                score += 2
            elif score == 2:
                score += 1
            match_score = min(100, score * 20)
            missing_skills_list = []

        results.append({
            "title": title,
            "company": company,
            "location": job.get("location") or "",
            "tags": tags,
            "url": url,
            "match_score": match_score,
            "missing_skills": missing_skills_list,
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)

    for i, job in enumerate(results):
        job["is_top_match"] = i < TOP_JOBS_COUNT and job.get("match_score", 0) > 0

    return results
