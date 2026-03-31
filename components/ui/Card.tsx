"use client";

import React from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  accent?: "grass" | "lava" | "sky" | "sand" | "stone";
  hoverEffect?: boolean;
}

export const Card = ({
  children,
  className = "",
  accent,
  hoverEffect = true,
}: CardProps) => {
  const accentStyles = {
    grass: "border-grass glow-grass",
    lava: "border-lava glow-lava",
    sky: "border-sky glow-sky",
    sand: "border-sand glow-sand",
    stone: "border-stone",
  };

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -5, scale: 1.01 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`
        relative bg-card border-2 p-6 overflow-hidden
        ${accent ? accentStyles[accent] : "border-border"}
        ${hoverEffect ? "hover:border-opacity-100" : ""}
        ${className}
      `}
    >
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:4px_4px]" />
      
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
