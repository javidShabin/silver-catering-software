import React from "react";

const FormSection = ({ title, description, children, className = "" }) => {
  return (
    <div className={`bg-white rounded-3xl border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden ${className}`}>
      {/* Header */}
      {(title || description) && (
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          {title && <h3 className="text-[16px] font-semibold text-slate-900 tracking-tight">{title}</h3>}
          {description && <p className="mt-1 text-[13px] text-slate-500">{description}</p>}
        </div>
      )}
      
      {/* Body */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default FormSection;
