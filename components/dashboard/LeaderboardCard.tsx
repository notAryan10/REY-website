"use client"

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Badge } from "@/components/ui/Badge";
import { Trophy, Award, Medal, Crown } from "lucide-react";

export function LeaderboardCard() {
  const { leaders, connected } = useLeaderboard();

  const getRankStyles = (index: number) => {
    switch (index) {
      case 0: return "border-sand bg-sand/10 text-sand shadow-[0_0_15px_rgba(255,209,102,0.2)]";
      case 1: return "border-stone/40 bg-stone/20 text-stone-200 shadow-[0_0_15px_rgba(255,255,255,0.05)]";
      case 2: return "border-lava/30 bg-lava/10 text-lava shadow-[0_0_15px_rgba(255,107,53,0.1)]";
      default: return "border-border/30 bg-stone/5 text-text-secondary";
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown size={14} className="text-sand" />;
      case 1: return <Award size={14} className="text-stone-300" />;
      case 2: return <Medal size={14} className="text-lava" />;
      default: return <Trophy size={14} className="opacity-20" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-grass animate-pulse' : 'bg-lava'}`} />
          <h2 className="text-lg uppercase font-pixel tracking-tighter">Top Architects</h2>
        </div>
        <Badge variant={connected ? 'grass' : 'lava'}>{connected ? 'LIVE' : 'OFFLINE'}</Badge>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {leaders.map((user, i) => (
            <motion.div
              layout
              key={user.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 border-2 rounded-sm flex items-center justify-between group transition-all duration-300 ${getRankStyles(i)}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-pixel text-[10px]">
                   {getRankIcon(i)}
                </div>
                <div>
                   <h4 className="text-sm font-sans font-bold uppercase tracking-tight group-hover:translate-x-1 transition-transform">{user.name}</h4>
                   <p className="text-[8px] uppercase font-pixel opacity-60">{user.role}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-pixel">{user.xp}</p>
                <p className="text-[8px] uppercase font-pixel opacity-40">Cumulative XP</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {leaders.length === 0 && (
           <div className="p-12 text-center border-2 border-dashed border-border/50 bg-stone/5">
              <p className="text-[10px] font-pixel text-text-secondary uppercase">Scanning for club signatures...</p>
           </div>
        )}
      </div>

      <div className="pt-4 flex justify-center">
         <p className="text-[8px] font-pixel text-text-secondary uppercase tracking-[0.2em]">Next Sync in 2.0s</p>
      </div>
    </div>
  );
}
