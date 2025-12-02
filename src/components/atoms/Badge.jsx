import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Badge = forwardRef(({ 
  children, 
  className, 
  variant = "default", 
  ...props 
}, ref) => {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    primary: "bg-primary bg-opacity-10 text-primary",
    success: "bg-success bg-opacity-10 text-success",
    warning: "bg-warning bg-opacity-10 text-warning",
    error: "bg-error bg-opacity-10 text-error"
  };

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
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