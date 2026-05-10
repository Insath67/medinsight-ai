from fastapi import FastAPI
import traceback

try:
    from app.main import app
except Exception as e:
    app = FastAPI(title="MedInsight AI Backend Debug")

    ERROR_TEXT = traceback.format_exc()

    @app.get("/")
    def debug_error():
        return {
            "status": "backend_import_failed",
            "error": str(e),
            "traceback": ERROR_TEXT,
        }

    @app.get("/health")
    def health():
        return {"status": "debug_mode"}
        