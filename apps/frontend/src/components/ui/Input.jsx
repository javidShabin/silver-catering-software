import { useState, forwardRef } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

const Input = forwardRef(({
  label,
  id,
  type = "text",
  error,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = "",
  inputClassName = "",
  placeholder,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;
  
  // If we have a floating label, we MUST use " " as the placeholder to make the CSS peer-placeholder-shown hack work without text overlap.
  const actualPlaceholder = label ? " " : (placeholder || " ");

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative group">
        {LeftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none z-10">
            <LeftIcon size={18} strokeWidth={2} />
          </div>
        )}

        <input
          ref={ref}
          id={id}
          type={inputType}
          placeholder={actualPlaceholder}
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
            transition-all duration-200 ease-out outline-none
            focus:bg-white focus:border-primary-300 focus:ring-[3px] focus:ring-primary-100/50
            hover:border-slate-300 hover:bg-slate-50
            disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed
            ${LeftIcon ? 'pl-11' : ''}
            ${(RightIcon || isPassword) ? 'pr-11' : ''}
            ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50/30 text-red-900' : ''}
            ${inputClassName}
          `}
          {...props}
        />

        {label && (
          <label
            htmlFor={id}
            className={`
              absolute text-slate-500 duration-200 transform -translate-y-3.5 scale-75 top-4 z-10 origin-[0]
              ${LeftIcon ? 'left-11' : 'left-4'}
              peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 
              peer-focus:top-4 peer-focus:-translate-y-3.5 peer-focus:scale-75
              peer-focus:text-primary-500 font-medium
              ${error ? 'peer-focus:text-red-500 text-red-500/80' : ''}
              pointer-events-none
            `}
          >
            {label}
          </label>
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:text-primary-500"
          >
            {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
          </button>
        )}

        {RightIcon && !isPassword && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <RightIcon size={18} strokeWidth={2} />
          </div>
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

Input.displayName = "Input";
export default Input;
