import React from "react";

function PatientCard({ patient, isSelected, onClick }) {
  const statusConfig = {
    ACTIVE: { label: "ACTIVE", bg: "bg-badge-active-bg", text: "text-badge-active" },
    WAITING: { label: "WAITING", bg: "bg-badge-waiting-bg", text: "text-badge-waiting" },
    DONE: { label: "DONE", bg: "bg-badge-done-bg", text: "text-badge-done" },
  };

  const status = statusConfig[patient.status] || statusConfig.WAITING;

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl cursor-pointer transition-all border ${
        isSelected
          ? "bg-brand-green-light border-brand-green/30 shadow-sm"
          : "bg-white border-border-light hover:border-brand-green/20 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-text-primary truncate">{patient.name}</h4>
          <p className="text-xs text-text-muted mt-0.5">
            DOB: {patient.dob} ({patient.age}y)
          </p>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${status.bg} ${status.text} shrink-0 ml-2`}>
          {status.label}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {patient.time}
        </span>
        <span>{patient.duration}</span>
      </div>
    </div>
  );
}

export default PatientCard;
