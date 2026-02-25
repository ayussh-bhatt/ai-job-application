import requests

REMOTEOK_API = "https://remoteok.com/api"

# 🔹 Skill synonyms mapping
SKILL_SYNONYMS = {

    # Frontend
    "javascript": ["js", "node", "node.js", "frontend", "web"],
    "react": ["react.js", "frontend", "ui", "next.js"],
    "html": ["frontend", "web"],
    "css": ["frontend", "ui", "tailwind", "bootstrap"],
    "typescript": ["ts", "javascript"],
    "angular": ["frontend"],
    "vue": ["vue.js", "frontend"],

    # Backend
    "python": ["django", "flask", "fastapi", "backend"],
    "java": ["spring", "spring boot", "backend"],
    "node.js": ["node", "express", "backend"],
    "express": ["node", "backend"],
    "php": ["laravel", "backend"],
    "c++": ["backend", "systems"],
    "c#": [".net", "backend"],

    # Data & AI
    "machine learning": ["ml", "ai", "deep learning"],
    "deep learning": ["ai", "neural networks"],
    "data science": ["ml", "ai", "analytics"],
    "pandas": ["data analysis"],
    "numpy": ["data analysis"],
    "tensorflow": ["deep learning", "ai"],
    "pytorch": ["deep learning", "ai"],

    # Databases
    "sql": ["postgresql", "mysql", "database"],
    "mongodb": ["nosql", "database"],
    "postgresql": ["sql", "database"],
    "mysql": ["sql", "database"],
    "redis": ["cache", "database"],

    # Cloud & DevOps
    "aws": ["cloud", "devops"],
    "azure": ["cloud"],
    "gcp": ["cloud"],
    "docker": ["containers", "devops"],
    "kubernetes": ["k8s", "devops", "containers"],
    "linux": ["devops", "systems"],
    "ci/cd": ["devops", "automation"],

    # Mobile
    "android": ["mobile"],
    "kotlin": ["android", "mobile"],
    "swift": ["ios", "mobile"],
    "react native": ["mobile"],

    # Tools
    "git": ["version control"],
    "github": ["git"],
    "jira": ["agile"],
}

# 🔹 Expand skills with synonyms
def expand_skills(skills):
    expanded = set()

    for skill in skills:
        skill_lower = skill.lower()
        expanded.add(skill_lower)

        if skill_lower in SKILL_SYNONYMS:
            expanded.update(SKILL_SYNONYMS[skill_lower])

    return expanded


def fetch_jobs(user_skills=None):
    try:
        response = requests.get(
            REMOTEOK_API,
            headers={"User-Agent": "Mozilla/5.0"}
        )
        data = response.json()

        jobs = []

        # skip metadata entry
        for job in data[1:20]:
            tags = job.get("tags") or []

            # 🔹 smart match scoring
            score = 0

            if user_skills:
                expanded_skills = expand_skills(user_skills)
                job_tags = [tag.lower() for tag in tags]

                for skill in expanded_skills:
                    if skill in job_tags:
                        score += 1

                # 🔹 bonus scoring for strong matches
                if score >= 3:
                    score += 2
                elif score == 2:
                    score += 1

            jobs.append({
                "title": job.get("position"),
                "company": job.get("company"),
                "location": job.get("location"),
                "tags": tags,
                "url": job.get("url"),
                "match_score": score
            })

        # 🔹 sort by relevance
        jobs.sort(key=lambda x: x["match_score"], reverse=True)

        return jobs

    except Exception as e:
        return {"error": str(e)}