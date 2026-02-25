import spacy

nlp = spacy.load("en_core_web_sm")

# basic skill database (expand later)
SKILLS_DB = [
    "python", "java", "c++", "javascript", "react", "node.js",
    "machine learning", "deep learning", "sql", "mongodb",
    "html", "css", "fastapi", "django", "aws", "docker",
    "data analysis", "pandas", "numpy", "tensorflow"
]

def extract_skills(text):
    text = text.lower()
    found_skills = []

    for skill in SKILLS_DB:
        if skill in text:
            found_skills.append(skill)

    return list(set(found_skills))