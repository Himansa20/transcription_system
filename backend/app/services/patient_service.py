from app.database import patients_collection

def get_all_patients():
    patients = []
    for patient in patients_collection.find():
        patient["_id"] = str(patient["_id"])  # Convert ObjectId to string
        patients.append(patient)
    return patients


def get_patient_by_id(patient_id: str):
    """Look up a patient by their patient_id field."""
    patient = patients_collection.find_one({"patient_id": patient_id})
    if patient:
        patient["_id"] = str(patient["_id"])
    return patient


def create_patient(data: dict):
    result = patients_collection.insert_one(data)
    return str(result.inserted_id)