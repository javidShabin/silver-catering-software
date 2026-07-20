import { forwardRef, useState } from "react";
import { ChevronDown, AlertCircle } from "lucide-react";

const Select = forwardRef(({
  label,
  id,
  error,
  options = [],
  className = "",
  leftIcon: LeftIcon,
  placeholder = " ",
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = props.value !== undefined && props.value !== "";

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative group">
        {LeftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none z-10">
            <LeftIcon size={18} strokeWidth={2} />
          </div>
        )}

        <select
          ref={ref}
          id={id}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={`
            peer block w-full px-4 pb-2.5 pt-5 text-[15px] max-md:text-[16px] font-medium text-slate-900 bg-slate-50/50 
            rounded-2xl border border-slate-200/80 shadow-[0_2px_4px_rgba(0,0,0,0.01)] 
            transition-all duration-200 ease-out outline-none appearance-none
            focus:bg-white focus:border-primary-300 focus:ring-[3px] focus:ring-primary-100/50
            hover:border-slate-300 hover:bg-slate-50
            disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed
            ${LeftIcon ? 'pl-11' : ''} pr-11
            ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50/30 text-red-900' : ''}
            ${!hasValue ? "text-transparent" : "text-slate-900"}
          `}
          {...props}
        >
          <option value="" disabled hidden>{placeholder !== " " ? placeholder : ""}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-slate-900 font-medium bg-white">
              {opt.label}
            </option>
          ))}
        </select>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors">
          <ChevronDown size={18} strokeWidth={2} className={`transition-transform duration-200 ${isFocused ? 'rotate-180 text-primary-500' : ''}`} />
        </div>

        {label && (
          <label
            htmlFor={id}
            className={`
              absolute text-slate-500 duration-200 transform z-10 origin-[0] pointer-events-none font-medium
              ${LeftIcon ? 'left-11' : 'left-4'}
              ${isFocused || hasValue
                ? 'top-4 -translate-y-3.5 scale-75' 
                : 'top-1/2 -translate-y-1/2 scale-100'}
              ${isFocused ? 'text-primary-500' : ''}
              ${error ? 'text-red-500/80' : ''}
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

Select.displayName = "Select";
export default Select;
