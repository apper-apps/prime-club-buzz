import React, { forwardRef, useEffect, useState } from "react";
import { cn } from "@/utils/cn";

const Input = forwardRef(({ 
  className, 
  type, 
  value: controlledValue, 
  onChange,
  detectUrlPrefix = false,
  urlPrefix = "https://",
  ...props 
}, ref) => {
  const [internalValue, setInternalValue] = useState(controlledValue || "");

  // Sync internal value with controlled value
  useEffect(() => {
    setInternalValue(controlledValue || "");
  }, [controlledValue]);

  const handleChange = (e) => {
    let newValue = e.target.value;
    
    // Apply URL prefix logic if enabled
    if (detectUrlPrefix && type === "url") {
      // Check if user is typing and doesn't have a protocol
      if (newValue && !newValue.match(/^https?:\/\//)) {
        // If the value doesn't start with the prefix, add it
        if (!newValue.startsWith(urlPrefix)) {
          newValue = urlPrefix + newValue;
        }
      }
    }
    
    setInternalValue(newValue);
    
    // Call the original onChange with the processed value
    if (onChange) {
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: newValue
        }
      };
      onChange(syntheticEvent);
    }
  };

  const displayValue = controlledValue !== undefined ? controlledValue : internalValue;

  return (
<input
type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-border-default bg-white px-4 py-3 text-sm font-sans text-text-primary placeholder:text-text-tertiary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 focus:border-primary-500 hover:border-border-medium disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-100 file:border-0 file:bg-transparent file:text-sm file:font-medium shadow-sm hover:shadow-md focus:shadow-md",
        type === "datetime-local" && "text-xs",
        className
      )}
      ref={ref}
      value={displayValue}
      onChange={handleChange}
      {...props}
    />
  )
})

Input.displayName = "Input"

export { Input }
export default Input