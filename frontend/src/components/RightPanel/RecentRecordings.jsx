import React from "react";

const MOCK_RECORDINGS = [
  { id: 1, title: "Initial Consultation - Cardiology", date: "Oct 24, 2023", time: "18:42" },
  { id: 2, title: "Post-Op Weekly Review", date: "Oct 18, 2023", time: "12:15" },
  { id: 3, title: "Symptom Log: Nocturnal Dyspnea", date: "Oct 12, 2023", time: "09:30" },
  { id: 4, title: "Initial Consultation - Cardiology", date: "Oct 24, 2023", time: "18:42" },
  { id: 5, title: "Post-Op Weekly Review", date: "Oct 18, 2023", time: "12:15" },
  { id: 6, title: "Symptom Log: Nocturnal Dyspnea", date: "Oct 12, 2023", time: "09:30" },
];

function RecentRecordings() {
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-1 mb-3">
        <h3 className="text-sm font-semibold text-text-primary">Recent Recordings</h3>
        <button className="text-xs font-semibold text-text-muted hover:text-brand-green transition-colors">
          VIEW ALL
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {MOCK_RECORDINGS.map((rec) => (
          <div
            key={rec.id}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-brand-green-light flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate group-hover:text-brand-green transition-colors">
                {rec.title}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {rec.date}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {rec.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentRecordings;
