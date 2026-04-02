from datetime import datetime
from app.database import queue_collection, patients_collection


def add_to_queue(patient_id: str):
    """Add a patient to the queue. Validates the patient exists first."""
    # Check patient exists
    patient = patients_collection.find_one({"patient_id": patient_id})
    if not patient:
        return None

    # Check if patient is already in queue with a non-completed status
    existing = queue_collection.find_one({
        "patient_id": patient_id,
        "status": {"$in": ["waiting", "in_progress"]}
    })
    if existing:
        existing["_id"] = str(existing["_id"])
        return {"already_in_queue": True, "entry": existing}

    # Auto-generate queue number (max + 1)
    last_entry = queue_collection.find_one(sort=[("queue_number", -1)])
    next_number = (last_entry["queue_number"] + 1) if last_entry else 1

    entry = {
        "patient_id": patient_id,
        "queue_number": next_number,
        "status": "waiting",
        "added_at": datetime.utcnow(),
        "updated_at": None,
    }
    result = queue_collection.insert_one(entry)
    entry["_id"] = str(result.inserted_id)
    return entry


def get_all_queue():
    """Return all queue entries sorted by queue_number ascending."""
    entries = []
    for entry in queue_collection.find().sort("queue_number", 1):
        entry["_id"] = str(entry["_id"])
        entries.append(entry)
    return entries


def get_queue_by_patient_id(patient_id: str):
    """Get the latest queue entry for a specific patient."""
    entry = queue_collection.find_one(
        {"patient_id": patient_id},
        sort=[("queue_number", -1)]
    )
    if entry:
        entry["_id"] = str(entry["_id"])
    return entry


def update_queue_status(patient_id: str, new_status: str):
    """Update the status of a patient's queue entry."""
    valid_statuses = ["waiting", "in_progress", "completed"]
    if new_status not in valid_statuses:
        return {"error": f"Invalid status. Must be one of {valid_statuses}"}

    result = queue_collection.find_one_and_update(
        {"patient_id": patient_id, "status": {"$ne": "completed"}},
        {"$set": {"status": new_status, "updated_at": datetime.utcnow()}},
        return_document=True,
        sort=[("queue_number", -1)]
    )
    if result:
        result["_id"] = str(result["_id"])
    return result
