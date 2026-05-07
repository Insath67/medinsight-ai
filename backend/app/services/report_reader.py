import os
import fitz  # PyMuPDF
from app.services.gemini_extractor import extract_text_with_gemini


def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    doc = fitz.open(file_path)

    for page in doc:
        text += page.get_text()

    doc.close()
    return text.strip()


def extract_text_from_report(file_path: str) -> str:
    file_ext = os.path.splitext(file_path)[1].lower()

    if file_ext == ".pdf":
        direct_text = extract_text_from_pdf(file_path)

        if direct_text and len(direct_text.strip()) > 30:
            return direct_text

        return extract_text_with_gemini(file_path)

    if file_ext in [".jpg", ".jpeg", ".png"]:
        return extract_text_with_gemini(file_path)

    return ""