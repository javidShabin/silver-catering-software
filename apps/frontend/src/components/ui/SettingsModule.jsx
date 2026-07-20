import { motion } from "framer-motion";

const SettingsModule = ({ title, description, children, icon: Icon, span = "col-span-1", className = "", action }) => {
  return (
    <motion.div
      whileHover={{ y: -2, shadow: "0 10px 30px rgba(0,0,0,0.03)" }}
      className={`
        relative group bg-white rounded-xl border border-slate-200 
        shadow-sm overflow-hidden flex flex-col
        ${span} ${className}
      `}
    >
      {/* Header */}
      {(title || Icon) && (
        <div className="px-5 pt-4 pb-2 flex justify-between items-start relative z-10">
          <div className="flex items-start gap-3">
            {Icon && (
              <div className="p-1.5 bg-slate-50 text-slate-500 rounded-lg border border-slate-100 mt-0.5">
                <Icon size={16} />
              </div>
            )}
            <div>
              {title && <h3 className="text-[13px] font-bold text-slate-800 tracking-tight">{title}</h3>}
              {description && <p className="text-[11px] leading-snug text-slate-500 mt-0.5">{description}</p>}
            </div>
          </div>
          {action && (
            <div className="shrink-0 ml-4">
              {action}
            </div>
          )}
        </div>
      )}
      
      {/* Body */}
      <div className="px-5 pb-4 pt-2 flex-1 relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export const ModuleRow = ({ label, description, children, className = "" }) => (
  <div className={`flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0 ${className}`}>
    <div className="flex-1 pr-4">
      <h4 className="text-[12px] font-semibold text-slate-700 tracking-tight">{label}</h4>
      {description && <p className="text-[10px] text-slate-500 leading-snug mt-0.5">{description}</p>}
    </div>
    <div className="shrink-0 text-[12px]">
      {children}
    </div>
  </div>
);

export default SettingsModule;
