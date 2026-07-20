import { forwardRef, useState } from "react";
import { AlertCircle } from "lucide-react";

const Textarea = forwardRef(({
  label,
  id,
  error,
  className = "",
  placeholder = " ",
  rows = 4,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative group">
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          placeholder={placeholder}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={`
            peer block w-full px-4 pb-2.5 pt-6 text-[15px] font-medium text-slate-900 bg-slate-50/50 
            rounded-2xl border border-slate-200/80 shadow-[0_2px_4px_rgba(0,0,0,0.01)] 
            transition-all duration-200 ease-out outline-none resize-y min-h-[100px]
            focus:bg-white focus:border-primary-300 focus:ring-[3px] focus:ring-primary-100/50
            hover:border-slate-300 hover:bg-slate-50
            disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed
            ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50/30 text-red-900' : ''}
          `}
          {...props}
        />

        {label && (
          <label
            htmlFor={id}
            className={`
              absolute text-slate-500 duration-200 transform z-10 origin-[0] pointer-events-none font-medium left-4
              peer-placeholder-shown:top-5 peer-placeholder-shown:scale-100 
              peer-focus:top-4 peer-focus:-translate-y-2 peer-focus:scale-75
              top-4 -translate-y-2 scale-75
              peer-focus:text-primary-500
              ${error ? 'peer-focus:text-red-500 text-red-500/80' : ''}
            `}
          >
            {label}
          </label>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 mt-2 ml-1 text-sm text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle size={14} strokeWidth={2.5} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

Textarea.displayName = "Textarea";
export default Textarea;
