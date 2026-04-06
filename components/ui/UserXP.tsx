"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, Trophy } from "lucide-react";

interface UserXPProps {
  xp: number;
  level: number;
  nextLevelXp: number;
  showDetails?: boolean;
}

export const UserXP = ({ xp, level, nextLevelXp, showDetails = false }: UserXPProps) => {
  const progress = (xp / nextLevelXp) * 100;

  return (
    <div className="flex flex-col gap-2 min-w-[120px]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 bg-grass/20 border border-grass/30 flex items-center justify-center rounded-sm">
            <Zap size={10} className="text-grass fill-grass/20" />
          </div>
          <span className="font-pixel text-[8px] uppercase text-text-secondary tracking-widest">
            Level {level}
          </span>
        </div>
        {showDetails && (
          <span className="font-pixel text-[6px] uppercase text-grass opacity-80">
            {xp} / {nextLevelXp} XP
          </span>
        )}
      </div>

      <div className="relative h-1.5 w-full bg-stone/50 overflow-hidden border border-border/50 rounded-full">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-grass to-sky"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] animate-shimmer pointer-events-none" />
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
};
