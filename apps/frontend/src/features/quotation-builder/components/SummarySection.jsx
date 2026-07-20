import React from "react";

const SummarySection = ({
  isViewMode,
  notes,
  onNotesChange
}) => {
  return (
    <fieldset disabled={isViewMode} className="flex-1">
      <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block mb-1">Terms & Conditions / Notes</label>
      <textarea 
        rows={3}
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Enter any terms, conditions, or special notes here..."
        className="w-full rounded border border-slate-200 p-2 text-[11px] bg-slate-50 outline-none focus:border-primary-500 focus:bg-white transition-colors resize-none"
      />
    </fieldset>
  );
};

// Memoize the component for performance if props remain stable
export default React.memo(SummarySection);
