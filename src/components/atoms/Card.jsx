import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Card = forwardRef(({ className, children, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-white border border-gray-200 rounded-lg shadow-sm',
    outlined: 'bg-white border-2 border-gray-300 rounded-lg',
    elevated: 'bg-white border border-gray-200 rounded-lg shadow-lg',
    flat: 'bg-gray-50 border border-gray-100 rounded-lg',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg shadow-sm'
  }

  return (
    <div
      ref={ref}
      className={cn(
        variants[variant] || variants.default,
        'transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
</div>
)
})

Card.displayName = 'Card'

export default Card