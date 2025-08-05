import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import { cn } from "@/utils/cn";

const Card = forwardRef(({ className, children, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-white border border-gray-200 rounded-lg shadow-sm',
    outlined: 'bg-white border-2 border-gray-300 rounded-lg',
    elevated: 'bg-white border border-gray-200 rounded-lg shadow-lg',
    flat: 'bg-gray-50 border border-gray-100 rounded-lg',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg shadow-sm'
  };

  // Defensive variant validation
  const selectedVariant = variants[variant] || variants.default;

  return (
    <div
      ref={ref}
      className={cn(
        selectedVariant,
        'transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

// Add displayName for better debugging
Card.displayName = 'Card';

// PropTypes validation
Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'outlined', 'elevated', 'flat', 'gradient'])
};

export default Card;

Card.displayName = 'Card'
