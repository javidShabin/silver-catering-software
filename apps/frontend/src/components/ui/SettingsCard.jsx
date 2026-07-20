export const SettingsRow = ({ label, description, children, className = "" }) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-start justify-between gap-4 py-4 first:pt-0 last:pb-0 border-b border-slate-200/40 last:border-0 ${className}`}>
      <div className="flex-1 pr-4">
        <h4 className="text-[13px] font-semibold text-slate-900 tracking-tight">{label}</h4>
        {description && <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <div className="shrink-0 flex items-center justify-start sm:justify-end min-w-[120px]">
        {children}
      </div>
    </div>
  );
};

const SettingsCard = ({ title, description, children, danger = false, className = "" }) => {
  return (
    <div className={`
      relative bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden 
      ${danger ? 'ring-1 ring-red-100/50 bg-red-50/10' : ''} 
      ${className}
    `}>
      {/* Header */}
      {(title || description) && (
        <div className={`px-6 pt-5 pb-3 ${danger ? 'bg-red-50/20' : ''}`}>
          {title && <h3 className={`text-[14px] font-bold tracking-tight ${danger ? 'text-red-700' : 'text-slate-900'}`}>{title}</h3>}
          {description && <p className={`mt-1 text-[12px] leading-relaxed ${danger ? 'text-red-500/80' : 'text-slate-500'}`}>{description}</p>}
        </div>
      )}
      
      {/* Body */}
      <div className="px-6 pb-6 pt-1">
        {children}
      </div>
    </div>
  );
};

export default SettingsCard;
