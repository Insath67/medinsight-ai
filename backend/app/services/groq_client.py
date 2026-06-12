import os
import json
import urllib.request
import urllib.error
from typing import Any, Dict, List, Optional


AI_API_KEY = os.getenv("AI_API_KEY") or os.getenv("GROQ_API_KEY")
AI_BASE_URL = os.getenv("AI_BASE_URL", "https://api.groq.com/openai/v1").rstrip("/")
AI_MODEL = os.getenv("AI_MODEL", "llama-3.3-70b-versatile")
AI_VISION_MODEL = os.getenv(
    "AI_VISION_MODEL",
    "meta-llama/llama-4-scout-17b-16e-instruct",
)


def groq_chat(
    messages: List[Dict[str, Any]],
    model: Optional[str] = None,
    temperature: float = 0.2,
    max_tokens: int = 1200,
) -> str:
    if not AI_API_KEY:
        raise ValueError("AI_API_KEY is missing in environment variables")

    payload = {
        "model": model or AI_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    request = urllib.request.Request(
        url=f"{AI_BASE_URL}/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {AI_API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            response_body = response.read().decode("utf-8")
            data = json.loads(response_body)

        return data["choices"][0]["message"]["content"] or ""

    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Groq API HTTP {e.code}: {error_body}")

    except Exception as e:
        raise RuntimeError(f"Groq API request failed: {str(e)}")