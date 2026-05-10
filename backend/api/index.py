from fastapi import FastAPI

app = FastAPI(title="MedInsight AI Backend")

@app.get("/")
def root():
    return {"message": "Vercel backend is working"}

@app.get("/health")
def health():
    return {"status": "ok"}