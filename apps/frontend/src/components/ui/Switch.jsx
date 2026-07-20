import { motion } from "framer-motion";

const Switch = ({ checked, onChange, disabled = false, className = "" }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full 
        transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 
        focus-visible:ring-primary-500 focus-visible:ring-offset-2
        ${checked ? "bg-primary-500" : "bg-slate-200"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      <span className="sr-only">Toggle setting</span>
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`
          inline-block h-5 w-5 transform rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] 
          ring-0 transition-transform duration-200 ease-in-out
          ${checked ? "translate-x-5" : "translate-x-0.5"}
        `}
      />
    </button>
  );
};

export default Switch;
