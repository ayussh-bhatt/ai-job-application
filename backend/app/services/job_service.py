import requests

REMOTEOK_API = "https://remoteok.com/api"

def fetch_jobs(user_skills=None):
    try:
        response = requests.get(REMOTEOK_API, headers={"User-Agent": "Mozilla/5.0"})
        data = response.json()

        jobs = []

        for job in data[1:20]:
            tags = job.get("tags", [])

            # calculate match score
            score = 0
            if user_skills:
                for skill in user_skills:
                    if skill.lower() in [tag.lower() for tag in tags]:
                        score += 1

            jobs.append({
                "title": job.get("position"),
                "company": job.get("company"),
                "location": job.get("location"),
                "tags": tags,
                "url": job.get("url"),
                "match_score": score
            })

        # sort jobs by match score (highest first)
        jobs.sort(key=lambda x: x["match_score"], reverse=True)

        return jobs

    except Exception as e:
        return {"error": str(e)}