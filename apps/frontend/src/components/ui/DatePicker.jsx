import React, { forwardRef } from "react";
import Input from "./Input";

const DatePicker = forwardRef(({ className = "", value, onChange, placeholder, disabled, required, label, error, leftIcon, inputClassName = "", ...props }, ref) => {
  return (
    <Input
      type="date"
      ref={ref}
      label={label}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      error={error}
      leftIcon={leftIcon}
      className={className}
      inputClassName={inputClassName}
      {...props}
    />
  );
});

DatePicker.displayName = "DatePicker";
export default DatePicker;
