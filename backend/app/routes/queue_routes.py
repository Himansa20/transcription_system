from fastapi import APIRouter, HTTPException
from app.services.queue_service import (
    add_to_queue,
    get_all_queue,
    get_queue_by_patient_id,
    update_queue_status,
)
from app.models.queue_model import QueueStatusUpdate

router = APIRouter()


@router.post("/queue/{patient_id}")
def add_patient_to_queue(patient_id: str):
    """Add a patient to the waiting queue."""
    result = add_to_queue(patient_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    if isinstance(result, dict) and result.get("already_in_queue"):
        raise HTTPException(
            status_code=409,
            detail="Patient is already in the queue",
        )
    return {"message": "Patient added to queue", "queue_entry": result}


@router.get("/queue")
def fetch_all_queue():
    """Retrieve all patients in the queue."""
    return get_all_queue()


@router.get("/queue/{patient_id}")
def fetch_queue_by_patient(patient_id: str):
    """Get a specific patient's queue entry."""
    entry = get_queue_by_patient_id(patient_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Queue entry not found for this patient")
    return entry


@router.put("/queue/{patient_id}")
def update_patient_queue_status(patient_id: str, body: QueueStatusUpdate):
    """Update queue status when patient arrives for appointment."""
    result = update_queue_status(patient_id, body.status)
    if result is None:
        raise HTTPException(status_code=404, detail="Active queue entry not found for this patient")
    if isinstance(result, dict) and result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return {"message": "Queue status updated", "queue_entry": result}
