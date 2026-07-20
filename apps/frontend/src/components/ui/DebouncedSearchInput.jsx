import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

const DebouncedSearchInput = ({
  onSearch,
  placeholder = "Search...",
  delay = 400,
  className = ""
}) => {
  const [localValue, setLocalValue] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(localValue);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue, delay, onSearch]);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
      <input 
        type="text"
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200/60 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/5 transition-all shadow-sm shadow-slate-100"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
    </div>
  );
};

export default React.memo(DebouncedSearchInput);
