from pydantic import BaseModel

class ConsultationMessageCreate(BaseModel):
    message_text: str