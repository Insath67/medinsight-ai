import os
import google.generativeai as genai

from app.core.config import GEMINI_API_KEY


genai.configure(api_key=GEMINI_API_KEY)


def extract_text_with_gemini(file_path: str) -> str:
    file_ext = os.path.splitext(file_path)[1].lower()

    mime_type_map = {
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
    }

    mime_type = mime_type_map.get(file_ext)

    if not mime_type:
        return ""

    uploaded_file = None

    try:
        uploaded_file = genai.upload_file(
            path=file_path,
            mime_type=mime_type,
        )

        prompt = """
You are a medical document text extraction assistant.

Task:
Extract all readable text from this medical report as accurately as possible.

Rules:
- Return only the extracted text.
- Do not summarize.
- Do not explain.
- Do not add extra commentary.
- Preserve numbers, units, headings, and ranges if visible.
- If a table is present, convert it into readable plain text lines.
"""

        model = genai.GenerativeModel("gemini-1.5-flash")

        response = model.generate_content(
            [uploaded_file, prompt]
        )

        return (response.text or "").strip()

    except Exception as e:
        print("Gemini extraction error:", str(e))
        return ""

    finally:
        if uploaded_file is not None:
            try:
                genai.delete_file(uploaded_file.name)
            except Exception:
                pass