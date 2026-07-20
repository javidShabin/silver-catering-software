import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

const Button = forwardRef(({
  children,
  variant = "primary",
  size = "default",
  isLoading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = "",
  disabled,
  ...props
}, ref) => {
  const baseStyles = "relative inline-flex items-center justify-center font-medium transition-all duration-200 outline-none select-none overflow-hidden whitespace-nowrap";
  
  const variants = {
    primary: `
      bg-gradient-to-b from-primary-500 to-primary-600 
      text-white 
      shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.15)]
      hover:from-primary-600 hover:to-primary-700 hover:shadow-[0_2px_4px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.15)]
      active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] active:from-primary-700 active:to-primary-800
      focus-visible:ring-[3px] focus-visible:ring-primary-100/50 focus-visible:border-primary-400
      border border-transparent
    `,
    secondary: `
      bg-white text-slate-700
      border border-slate-200/80
      shadow-[0_1px_2px_rgba(0,0,0,0.02)]
      hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900
      active:bg-slate-100
      focus-visible:ring-[3px] focus-visible:ring-slate-100 focus-visible:border-slate-300
    `,
    outline: `
      bg-transparent text-slate-700
      border border-slate-200/80
      hover:bg-slate-50/80 hover:text-slate-900 hover:border-slate-300
      active:bg-slate-100
      focus-visible:ring-[3px] focus-visible:ring-slate-100 focus-visible:border-slate-300
    `,
    ghost: `
      bg-transparent text-slate-600
      hover:bg-slate-100/80 hover:text-slate-900
      active:bg-slate-200/60
      focus-visible:ring-[3px] focus-visible:ring-slate-100
    `,
    danger: `
      bg-red-500 text-white
      shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.1)]
      hover:bg-red-600
      active:bg-red-700 active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]
      focus-visible:ring-[3px] focus-visible:ring-red-100
      border border-transparent
    `
  };

  const sizes = {
    sm: "h-8 max-md:h-9 max-md:px-4 text-[13px] rounded-lg gap-1.5",
    default: "h-10 max-md:h-11 px-4 text-[14px] rounded-xl gap-2",
    lg: "h-12 max-md:h-14 px-6 text-[15px] max-md:text-[16px] rounded-2xl gap-2",
    icon: "h-10 max-md:h-11 w-10 max-md:w-11 justify-center rounded-xl"
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${isDisabled ? 'opacity-60 cursor-not-allowed saturate-[0.8]' : 'hover:-translate-y-[0.5px]'}
        ${className}
      `}
      {...props}
    >
      {/* Loading Spinner */}
      {isLoading && (
        <Loader2 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" 
          size={size === 'sm' ? 14 : 18} 
        />
      )}

      {/* Button Content (hidden when loading but preserves width) */}
      <div className={`flex items-center justify-center gap-[inherit] ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {LeftIcon && <LeftIcon size={size === 'sm' ? 14 : 18} strokeWidth={2} className="shrink-0" />}
        {children}
        {RightIcon && <RightIcon size={size === 'sm' ? 14 : 18} strokeWidth={2} className="shrink-0" />}
      </div>
    </button>
  );
});

Button.displayName = "Button";
export default Button;
