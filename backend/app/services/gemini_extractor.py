import os
import base64
import mimetypes
from openai import OpenAI


AI_API_KEY = os.getenv("AI_API_KEY") or os.getenv("GROQ_API_KEY")
AI_BASE_URL = os.getenv("AI_BASE_URL", "https://api.groq.com/openai/v1")
AI_VISION_MODEL = os.getenv(
    "AI_VISION_MODEL",
    "meta-llama/llama-4-scout-17b-16e-instruct"
)


def _encode_image_to_data_url(file_path: str) -> str:
    mime_type, _ = mimetypes.guess_type(file_path)

    if not mime_type:
        mime_type = "image/png"

    with open(file_path, "rb") as image_file:
        encoded_image = base64.b64encode(image_file.read()).decode("utf-8")

    return f"data:{mime_type};base64,{encoded_image}"


def _extract_pdf_text(file_path: str) -> str:
    try:
        from pypdf import PdfReader

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
    Old function name kept to avoid breaking existing imports.
    Now it uses Groq instead of Gemini.
    """

    try:
        if not file_path:
            return ""

        lower_path = file_path.lower()

        # For normal text-based PDFs
        if lower_path.endswith(".pdf"):
            pdf_text = _extract_pdf_text(file_path)

            if pdf_text:
                return pdf_text

            print("PDF has no readable text. It may be a scanned PDF/image PDF.")
            return ""

        # For image reports: jpg, jpeg, png, webp
        if not AI_API_KEY:
            raise ValueError("AI_API_KEY is missing in .env file")

        data_url = _encode_image_to_data_url(file_path)

        client = OpenAI(
            api_key=AI_API_KEY,
            base_url=AI_BASE_URL,
        )

        response = client.chat.completions.create(
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
        )

        return (response.choices[0].message.content or "").strip()

    except Exception as e:
        print("Groq extractor error:", str(e))
        return ""