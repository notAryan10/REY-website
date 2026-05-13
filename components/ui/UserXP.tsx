"use client";

import React from "react";
import { motion } from "framer-motion";

interface UserXPProps {
  xp: number;
  level: number;
  nextLevelXp: number;
  showDetails?: boolean;
}

export const UserXP = ({ xp, level, nextLevelXp, showDetails = false }: UserXPProps) => {
  const progress = (xp / nextLevelXp) * 100;

  return (
    <div className="flex flex-col gap-1.5 min-w-[140px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-pixel text-[8px] uppercase text-white tracking-tighter opacity-90">
            LVL
          </span>
          <span className="font-pixel text-[10px] uppercase text-grass tracking-tighter font-bold">
            {level}
          </span>
        </div>
        {showDetails && (
          <span className="font-pixel text-[7px] uppercase text-text-secondary opacity-60">
            {Math.floor(xp)}/{nextLevelXp}
          </span>
        )}
      </div>

      <div className="relative h-2 w-full bg-stone/20 overflow-hidden border border-border/30 rounded-full shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-grass via-grass to-sky"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-shimmer pointer-events-none opacity-30" />
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite linear;
        }
      `}</style>
    </div>
  );
};
