"use client";

import React from "react";
import { motion } from "framer-motion";

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "grass" | "lava" | "sky" | "sand" | "stone";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export const Button = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  onClick,
  disabled,
  type = "button",
}: ButtonProps) => {
  const baseStyles = "relative inline-flex items-center justify-center font-pixel text-xs tracking-tight transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase";
  
  const variants = {
    primary: "bg-white text-background hover:bg-stone-200",
    secondary: "border-2 border-white text-white hover:bg-white/10",
    ghost: "text-white hover:bg-white/5",
    grass: "bg-grass text-white hover:shadow-[0_0_15px_rgba(76,175,80,0.5)]",
    lava: "bg-lava text-white hover:shadow-[0_0_15px_rgba(255,107,53,0.5)]",
    sky: "bg-sky text-white hover:shadow-[0_0_15px_rgba(91,192,235,0.5)]",
    sand: "bg-sand text-background hover:shadow-[0_0_15px_rgba(255,209,102,0.5)]",
    stone: "bg-stone text-white border-2 border-border hover:bg-stone/80",
  };

  const sizes = {
    sm: "px-3 py-2 text-[10px]",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-sm",
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={{ 
        scale: 1.05,
        y: -2,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.95 }}
      className={`
        ${baseStyles} ${variants[variant]} ${sizes[size]} ${className}
        group overflow-hidden
      `}
    >
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
      <span className="relative z-10 flex items-center gap-2 transition-transform duration-200 group-hover:translate-x-0.5">
        {children}
      </span>
    </motion.button>
  );
};
