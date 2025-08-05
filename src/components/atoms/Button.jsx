import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

const Button = forwardRef(({ 
  children, 
  className, 
  variant = "primary", 
  size = "md", 
  disabled = false,
...props 
}, ref) => {
  const variants = {
    default: "bg-gradient-to-r from-primary-600 to-primary-700 text-text-inverse hover:from-primary-700 hover:to-primary-800 shadow-md hover:shadow-lg border-0 font-medium",
    primary: "bg-gradient-to-r from-primary-600 to-primary-700 text-text-inverse hover:from-primary-700 hover:to-primary-800 shadow-md hover:shadow-lg border-0 font-medium",
    secondary: "bg-white text-text-primary border border-border-default hover:bg-surface-50 hover:border-border-medium hover:shadow-sm font-medium",
    accent: "bg-gradient-to-r from-accent-500 to-accent-600 text-text-inverse hover:from-accent-600 hover:to-accent-700 shadow-md hover:shadow-lg border-0 font-medium",
    outline: "border border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-500 hover:text-primary-700 bg-white font-medium",
    ghost: "text-text-secondary hover:text-text-primary hover:bg-surface-100 border-0 font-medium",
    danger: "bg-gradient-to-r from-error-600 to-error-700 text-text-inverse hover:from-error-700 hover:to-error-800 shadow-md hover:shadow-lg border-0 font-medium",
    destructive: "bg-gradient-to-r from-error-600 to-error-700 text-text-inverse hover:from-error-700 hover:to-error-800 shadow-md hover:shadow-lg border-0 font-medium",
    success: "bg-gradient-to-r from-success-600 to-success-700 text-text-inverse hover:from-success-700 hover:to-success-800 shadow-md hover:shadow-lg border-0 font-medium",
    warning: "bg-gradient-to-r from-warning-500 to-warning-600 text-text-inverse hover:from-warning-600 hover:to-warning-700 shadow-md hover:shadow-lg border-0 font-medium",
    info: "bg-gradient-to-r from-info-500 to-info-600 text-text-inverse hover:from-info-600 hover:to-info-700 shadow-md hover:shadow-lg border-0 font-medium"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm font-medium tracking-wide",
    md: "px-4 py-2.5 text-sm font-medium tracking-wide",
    lg: "px-6 py-3 text-base font-medium tracking-wide"
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-sans transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
});

Button.displayName = "Button";

export default Button;