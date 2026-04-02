import React from "react";

function AiChatInput() {
  return (
    <div className="mt-auto pt-4">
      <div className="relative">
        <button className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-brand-green transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
        <input
          type="text"
          placeholder="Ask Anything from AI...."
          className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-border-light rounded-2xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/20 transition-all"
        />
      </div>
    </div>
  );
}

export default AiChatInput;
