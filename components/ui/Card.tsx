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
      whileHover={hoverEffect ? { 
        y: -8, 
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
      } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`
        relative bg-card/80 backdrop-blur-sm border-2 p-6 overflow-hidden
        ${accent ? accentStyles[accent] : "border-border"}
        ${hoverEffect ? "hover:border-opacity-100 cursor-pointer shadow-lg" : ""}
        ${className}
      `}
    >
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:8px_8px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
