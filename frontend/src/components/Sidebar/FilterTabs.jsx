import React from "react";

function FilterTabs({ activeFilter, onFilterChange }) {
  const tabs = ["ALL", "WAITING", "ACTIVE"];

  return (
    <div className="flex items-center gap-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onFilterChange(tab)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
            activeFilter === tab
              ? "bg-text-primary text-white"
              : "bg-white border border-border-light text-text-secondary hover:border-text-muted"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export default FilterTabs;
