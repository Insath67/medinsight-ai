import base64
import mimetypes

from app.services.groq_client import groq_chat, AI_VISION_MODEL


def _encode_image_to_data_url(file_path: str) -> str:
    mime_type, _ = mimetypes.guess_type(file_path)

    if not mime_type:
        mime_type = "image/png"

    with open(file_path, "rb") as image_file:
        encoded_image = base64.b64encode(image_file.read()).decode("utf-8")

    return f"data:{mime_type};base64,{encoded_image}"


def _extract_pdf_text(file_path: str) -> str:
    try:
        try:
            from pypdf import PdfReader
        except Exception:
            from PyPDF2 import PdfReader

        reader = PdfReader(file_path)
        text = ""

        for page in reader.pages:
            page_text = page.extract_text() or ""
            text += page_text + "\n"

        return text.strip()

    except Exception as e:
        print("PDF text extraction error:", str(e))
        return ""


def extract_text_with_gemini(file_path: str) -> str:
    """
    Old function name kept so existing routes will not break.
    Now this uses Groq instead of Gemini.
    """

    try:
        if not file_path:
            return ""

        lower_path = file_path.lower()

        if lower_path.endswith(".pdf"):
            pdf_text = _extract_pdf_text(file_path)

            if pdf_text:
                return pdf_text

            return ""

        data_url = _encode_image_to_data_url(file_path)

        return groq_chat(
            model=AI_VISION_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "Extract all visible medical report text from this image. "
                                "Return only the extracted text. Do not summarize."
                            ),
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": data_url,
                            },
                        },
                    ],
                }
            ],
            temperature=0,
            max_tokens=2000,
        ).strip()

    except Exception as e:
        print("Groq extractor error:", str(e))
        return ""