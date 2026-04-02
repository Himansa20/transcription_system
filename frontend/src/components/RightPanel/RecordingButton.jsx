import React from "react";

function RecordingButton({ recording, onStart, onStop, disabled }) {
  return (
    <button
      onClick={recording ? onStop : onStart}
      disabled={disabled}
      className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl text-base font-semibold transition-all active:scale-[0.97] ${
        recording
          ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25"
          : "bg-brand-green hover:bg-brand-green-dark text-white shadow-lg shadow-brand-green/25"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {/* Waveform Icon */}
      <div className="flex items-center gap-0.5 h-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-1 rounded-full bg-white ${
              recording ? "animate-pulse" : ""
            }`}
            style={{
              height: `${[14, 22, 10, 18][i - 1]}px`,
              animationDelay: recording ? `${i * 0.15}s` : "0s",
            }}
          />
        ))}
      </div>
      {recording ? "Stop Recording" : "Start Recording"}
    </button>
  );
}

export default RecordingButton;
