import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Badge = forwardRef(({ 
  children, 
  className, 
  variant = "default", 
  size = "sm",
  ...props 
}, ref) => {
const variants = {
    default: "bg-surface-100 text-text-primary border-border-default",
    primary: "bg-primary-100 text-primary-800 border-primary-200",
    secondary: "bg-surface-200 text-text-secondary border-border-medium",
    accent: "bg-accent-100 text-accent-800 border-accent-200",
    success: "bg-success-100 text-success-800 border-success-200",
    warning: "bg-warning-100 text-warning-800 border-warning-200",
    error: "bg-error-100 text-error-800 border-error-200",
    danger: "bg-error-100 text-error-800 border-error-200",
    destructive: "bg-error-100 text-error-800 border-error-200",
    info: "bg-info-100 text-info-800 border-info-200",
    outline: "bg-transparent text-text-secondary border-border-medium hover:bg-surface-50"
  };

  const sizes = {
    sm: "px-2.5 py-0.5 text-xs font-medium tracking-wide",
    md: "px-3 py-1 text-sm font-medium tracking-wide"
  };

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center border rounded-full font-sans transition-all duration-300 hover:shadow-sm",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

export default Badge;