from fastapi import FastAPI, Request, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ollama_utils import get_fit_score, find_missing_keywords, get_suggestions_from_ollama
import pdfplumber
import docx

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResumeRequest(BaseModel):
    resume: str
    job_description: str

# text-based endpoint
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

# resume upload endpoint
def extract_text(file: UploadFile) -> str:
    content = ""
    if file.filename.endswith(".pdf"):
        with pdfplumber.open(file.file) as pdf:
            for page in pdf.pages:
                content += page.extract_text() or ""
    elif file.filename.endswith(".docx"):
        doc = docx.Document(file.file)
        content = "\n".join([para.text for para in doc.paragraphs])
    else:
        content = file.file.read().decode("utf-8")
    return content.strip()

@app.post("/analyze/upload")
async def analyze_uploaded_resume(
    resume_file: UploadFile = File(...),
    job_description: str = Form(...)
):
    try:
        resume_text = extract_text(resume_file)
        score = get_fit_score(resume_text, job_description)
        missing = find_missing_keywords(resume_text, job_description)
        suggestions = get_suggestions_from_ollama(resume_text, job_description)

        return {
            "fit_score": score,
            "missing_keywords": missing,
            "suggestions": suggestions
        }
    except Exception as e:
        return { "error": str(e) }
