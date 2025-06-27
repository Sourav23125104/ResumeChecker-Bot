from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ollama_utils import get_fit_score, find_missing_keywords, get_suggestions_from_ollama

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResumeRequest(BaseModel):
    resume: str
    job_description: str

@app.post("/analyze")
async def analyze(req: ResumeRequest):
    score = get_fit_score(req.resume, req.job_description)
    missing = find_missing_keywords(req.resume, req.job_description)
    suggestions = get_suggestions_from_ollama(req.resume, req.job_description)

    return {
        "fit_score": score,
        "missing_keywords": missing,
        "suggestions": suggestions
    }
