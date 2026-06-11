import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine

from app.models import (
    User,
    PatientProfile,
    DoctorProfile,
    MedicalReport,
    ReportAnalysis,
    LabTestResult,
    ChatMessage,
    Consultation,
    ConsultationMessage,
    DoctorNote,
)

from app.routes.auth import router as auth_router
from app.routes.patients import router as patients_router
from app.routes.doctors import router as doctors_router
from app.routes.reports import router as reports_router
from app.routes.report_analysis import router as report_analysis_router
from app.routes.chat import router as chat_router
from app.routes.consultations import router as consultations_router
from app.routes.consultation_chat import router as consultation_chat_router
from app.routes.admin import router as admin_router
from app.routes.doctor_notes import router as doctor_notes_router
from app.routes.dashboard import router as dashboard_router
from app.routes import notifications
from app.routes.reminders import router as reminders_router
from app.routes.search import router as search_router
from app.routes.audit_logs import router as audit_logs_router
from app.routes.care_plans import router as care_plans_router
from app.routes.feedback import router as feedback_router


Base.metadata.create_all(bind=engine)

app = FastAPI(title="MedInsight AI API")


# -----------------------------
# CORS CONFIGURATION
# -----------------------------

FRONTEND_URL = os.getenv("FRONTEND_URL", "").strip().rstrip("/")

allowed_origins = [
    # Local Next.js frontend
    "http://localhost:3000",
    "http://127.0.0.1:3000",

    # Local Vite frontend, if used
    "http://localhost:5173",
    "http://127.0.0.1:5173",

    # Your Vercel frontend URLs
    "https://medinsight-ai-zeta.vercel.app",
    "https://medinsight-ai.vercel.app",
]

if FRONTEND_URL:
    allowed_origins.append(FRONTEND_URL)

# Remove duplicates and empty values
allowed_origins = list(dict.fromkeys([origin for origin in allowed_origins if origin]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# ROUTERS
# -----------------------------

app.include_router(auth_router)
app.include_router(patients_router)
app.include_router(doctors_router)
app.include_router(reports_router)
app.include_router(report_analysis_router)
app.include_router(chat_router)
app.include_router(consultations_router)
app.include_router(consultation_chat_router)
app.include_router(admin_router)
app.include_router(doctor_notes_router)
app.include_router(dashboard_router)
app.include_router(notifications.router)
app.include_router(reminders_router)
app.include_router(search_router)
app.include_router(audit_logs_router)
app.include_router(care_plans_router)
app.include_router(feedback_router)


# -----------------------------
# HEALTH ROUTES
# -----------------------------

@app.get("/")
def root():
    return {"message": "Welcome to MedInsight AI backend"}


@app.get("/health")
def health():
    return {"status": "ok"}