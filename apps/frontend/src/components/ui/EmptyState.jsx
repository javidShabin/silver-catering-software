import { Ghost } from "lucide-react";
import Button from "./Button";
import { motion } from "framer-motion";

const EmptyState = ({
  icon: Icon = Ghost,
  title = "No data found",
  description = "There is nothing to display here at the moment.",
  actionLabel,
  onAction,
  className = "",
  animate = true
}) => {
  const content = (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-3xl border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] ${className}`}>
      <div className="relative mb-6">
        {/* Soft backdrop glow behind icon */}
        <div className="absolute inset-0 bg-primary-100 blur-2xl rounded-full opacity-50 scale-150" />
        <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/80 rounded-2xl shadow-sm text-slate-400">
          <Icon size={32} strokeWidth={1.5} />
        </div>
      </div>
      
      <h3 className="text-[18px] font-semibold text-slate-900 tracking-tight mb-2">
        {title}
      </h3>
      
      <p className="text-[14px] text-slate-500 max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      {content}
    </motion.div>
  );
};

export default EmptyState;
