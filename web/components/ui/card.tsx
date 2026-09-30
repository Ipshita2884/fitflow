"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "./button";

interface CardProps extends HTMLMotionProps<"div"> {
  glass?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.3)" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn(
          "rounded-2xl border border-slate-500/20 bg-ink-700/50 text-surface p-6 overflow-hidden relative",
          glass && "glass",
          className
        )}
        {...props}
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100 pointer-events-none" />
        {children as React.ReactNode}
      </motion.div>
    );
  }
);
Card.displayName = "Card";

export { Card };
