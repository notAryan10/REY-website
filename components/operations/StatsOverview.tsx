"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Zap, 
  Flame, 
  Clock 
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { IUserQuest, IStreak } from "@/types";

interface StatsOverviewProps {
  quests: IUserQuest[];
  streak: IStreak | null;
  loading: boolean;
  onReset?: () => void;
}

export function StatsOverview({ quests, streak, loading, onReset }: StatsOverviewProps) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      
      if (diff <= 0) {
        if (onReset) onReset();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [onReset]);

  const completedQuests = quests.filter(q => q.completed && q.questId);
  const completedCount = completedQuests.length;
  const xpEarned = completedQuests.reduce((acc, q) => acc + (q.questId?.xpReward || 0), 0);

  const stats = [
    {
      title: "MISSIONS COMPLETED",
      value: loading ? "..." : `${completedCount} / ${quests.length}`,
      icon: <CheckCircle2 className="text-architect-green" size={20} />,
      accent: "green"
    },
    {
      title: "XP EARNED TODAY",
      value: loading ? "..." : `+${xpEarned} XP`,
      icon: <Zap className="text-architect-blue" size={20} />,
      accent: "blue"
    },
    {
      title: "SYNC STREAK",
      value: loading ? "..." : `${streak?.currentStreak || 0} DAYS`,
      icon: <Flame className="text-architect-orange" size={20} />,
      accent: "orange"
    },
    {
      title: "RESET TIMER",
      value: timeLeft,
      icon: <Clock className="text-architect-gold" size={20} />,
      accent: "gold"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="bg-architect-surface/40 border-white/10 p-6 flex flex-col items-center text-center group hover:border-white/20 transition-colors">
            <div className="mb-4 p-3 rounded-lg bg-white/5 group-hover:scale-110 transition-transform">
              {stat.icon}
            </div>
            <p className="text-[9px] font-pixel text-text-secondary mb-2 tracking-tighter">
              {stat.title}
            </p>
            <p className="text-xl font-pixel text-white tracking-tighter">
              {stat.value}
            </p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
