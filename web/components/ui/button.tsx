"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "default" | "outline" | "ghost" | "accent";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-surface text-ink-950 hover:bg-surface/90 border border-slate-200/20",
      accent: "bg-accent text-accent-ink hover:bg-accent/90 shadow-[0_0_15px_rgba(198,241,53,0.3)] hover:shadow-[0_0_25px_rgba(198,241,53,0.5)]",
      outline: "border border-slate-500/30 text-surface hover:bg-slate-500/10",
      ghost: "text-surface hover:bg-surface/10",
    };

    const sizes = {
      default: "h-11 px-6 py-2",
      sm: "h-9 rounded-md px-4",
      lg: "h-12 rounded-md px-8 text-lg",
      icon: "h-11 w-11",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02, translateY: -2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button, cn };
