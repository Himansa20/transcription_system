from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class QueueEntry(BaseModel):
    patient_id: str
    queue_number: int = 0
    status: str = "waiting"  # waiting | in_progress | completed
    added_at: datetime = None
    updated_at: Optional[datetime] = None


class QueueStatusUpdate(BaseModel):
    status: str  # waiting | in_progress | completed
