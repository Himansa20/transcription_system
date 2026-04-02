from fastapi import APIRouter, HTTPException
from app.services.patient_service import get_all_patients, get_patient_by_id, create_patient
from app.models.patient_model import Patient

router = APIRouter()

@router.get("/patients")
def fetch_patients():
    return get_all_patients()


@router.get("/patients/{patient_id}")
def fetch_patient(patient_id: str):
    patient = get_patient_by_id(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.post("/patients")
def add_patient(patient: Patient):
    patient_dict = patient.dict()
    patient_id = create_patient(patient_dict)
    return {"message": "Patient added", "id": patient_id}