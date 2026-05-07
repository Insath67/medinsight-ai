import os
from google import genai
from app.core.config import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY)


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
        uploaded_file = client.files.upload(
            file=file_path,
            config={"mime_type": mime_type}
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

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[uploaded_file, prompt]
        )

        return (response.text or "").strip()

    finally:
        if uploaded_file is not None:
            try:
                client.files.delete(name=uploaded_file.name)
            except Exception:
                pass