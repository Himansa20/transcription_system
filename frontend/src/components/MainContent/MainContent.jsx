import React from "react";
import SessionHeader from "./SessionHeader";
import ContentTabs from "./ContentTabs";
import AiChatInput from "./AiChatInput";

function MainContent({ transcript, recording }) {
  return (
    <main className="flex-1 flex flex-col bg-white p-6 overflow-hidden">
      <SessionHeader />
      <ContentTabs />

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto py-8">
        {transcript ? (
          <div className="w-full max-w-2xl">
            <div className="bg-gray-50 rounded-xl p-6 border border-border-light">
              <p className="text-sm leading-relaxed text-text-primary whitespace-pre-wrap">{transcript}</p>
            </div>
          </div>
        ) : (
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-brand-green-light flex items-center justify-center">
              <svg className="w-8 h-8 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Begin the session from the header by selecting "Start Recording"
            </h3>
            <p className="text-sm text-text-muted">
              Your chat will appear here once your session is complete
            </p>
          </div>
        )}
      </div>

      <AiChatInput />
    </main>
  );
}

export default MainContent;
