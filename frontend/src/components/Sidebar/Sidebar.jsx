import React, { useState } from "react";
import FilterTabs from "./FilterTabs";
import PatientCard from "./PatientCard";

const MOCK_PATIENTS = [
  {
    id: "PAT001",
    name: "Chathumini Dhananjani",
    dob: "05/12/1978",
    age: 46,
    time: "10:00 AM",
    duration: "15 min",
    status: "ACTIVE",
  },
  {
    id: "PAT002",
    name: "Chathumini Dhananjani",
    dob: "05/12/1978",
    age: 46,
    time: "10:00 AM",
    duration: "15 min",
    status: "WAITING",
  },
  {
    id: "PAT003",
    name: "Chathumini Dhananjani",
    dob: "05/12/1978",
    age: 46,
    time: "10:00 AM",
    duration: "15 min",
    status: "WAITING",
  },
  {
    id: "PAT004",
    name: "Chathumini Dhananjani",
    dob: "05/12/1978",
    age: 46,
    time: "10:00 AM",
    duration: "15 min",
    status: "DONE",
  },
];

function Sidebar({ selectedPatientId, onSelectPatient }) {
  const [activeFilter, setActiveFilter] = useState("ALL");

  const filteredPatients =
    activeFilter === "ALL"
      ? MOCK_PATIENTS
      : MOCK_PATIENTS.filter((p) => p.status === activeFilter);

  return (
    <aside className="w-72 bg-sidebar-bg border-r border-border-light flex flex-col h-full overflow-hidden">
      {/* Start New Session Button */}
      <div className="p-4 pb-3">
        <button className="w-full flex items-center justify-center gap-2 bg-brand-green hover:bg-brand-green-dark text-white px-5 py-3 rounded-full text-sm font-semibold transition-all hover:shadow-lg hover:shadow-brand-green/20 active:scale-[0.98]">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          START NEW SESSION
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 pb-3">
        <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      </div>

      {/* Recent Label */}
      <div className="px-4 pb-2 flex items-center gap-1.5">
        <span className="text-xs font-semibold text-text-secondary">Recent</span>
        <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Patient List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
        {filteredPatients.map((patient) => (
          <PatientCard
            key={patient.id}
            patient={patient}
            isSelected={selectedPatientId === patient.id}
            onClick={() => onSelectPatient(patient)}
          />
        ))}
        {filteredPatients.length === 0 && (
          <p className="text-center text-sm text-text-muted py-8">No patients found</p>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
