import React from "react";
import RecordingButton from "./RecordingButton";
import RecentRecordings from "./RecentRecordings";

function RightPanel({ recording, onStartRecording, onStopRecording, status }) {
  return (
    <aside className="w-72 bg-white border-l border-border-light flex flex-col h-full overflow-hidden p-5">
      {/* Export / Share Button */}
      <div className="flex items-center justify-end mb-4">
        <button className="p-2.5 rounded-xl border border-border-light text-text-secondary hover:text-text-primary hover:border-text-muted transition-colors" title="Export">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </button>
      </div>

      {/* Start Recording */}
      <div className="mb-6">
        <RecordingButton
          recording={recording}
          onStart={onStartRecording}
          onStop={onStopRecording}
          disabled={status === "connecting"}
        />
      </div>

      {/* Recent Recordings */}
      <RecentRecordings />
    </aside>
  );
}

export default RightPanel;
