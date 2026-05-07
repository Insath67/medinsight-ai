from pydantic import BaseModel

class ChatQuestionRequest(BaseModel):
    question: str