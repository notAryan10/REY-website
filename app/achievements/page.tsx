"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Lock, CheckCircle, Search, Zap } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import * as LucideIcons from "lucide-react";
import { Achievement } from "@/types";

// Map rarity to project theme colors
const RARITY_MAP: Record<string, "grass" | "lava" | "sky" | "sand" | "stone"> = {
  common: "stone",
  rare: "sky",
  epic: "lava",
  legendary: "sand",
  mythic: "grass",
};

const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
  const accent = achievement.unlocked ? RARITY_MAP[achievement.rarity] || "stone" : "stone";
  const IconComponent = (LucideIcons as unknown as Record<string, React.ElementType>)[achievement.icon] || Trophy;
  
  const progressPercent = Math.min(((achievement.progress || 0) / achievement.requirementValue) * 100, 100);

  return (
    <Card 
      accent={accent} 
      className={`group relative overflow-hidden transition-all duration-500 min-h-[220px] ${
        !achievement.unlocked ? "opacity-50 grayscale" : ""
      }`}
    >
      <div className="flex flex-col h-full space-y-6">
        {/* Header: Icon and Status Area */}
        <div className="flex items-start justify-between">
          <div className={`w-14 h-14 flex items-center justify-center rounded-lg border-2 transition-all duration-500 shadow-lg ${
            achievement.unlocked ? `border-${accent} bg-${accent}/10 text-${accent} shadow-${accent}/20` : "border-border/50 bg-stone/20 text-text-secondary"
          }`}>
            <IconComponent size={28} className={achievement.unlocked ? "animate-pulse" : ""} />
          </div>
          
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2">
              {achievement.unlocked && <CheckCircle size={12} className={`text-${accent}`} />}
              {!achievement.unlocked && <Lock size={12} className="text-text-secondary/50" />}
              <Badge variant={accent} className="text-[7px] font-pixel px-2 py-0.5 tracking-tighter">
                {achievement.rarity.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-sand/80">
               <Zap size={10} className="fill-sand/50" />
               <span className="text-[10px] font-pixel tracking-tighter">+{achievement.xpReward} XP</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-2 flex-grow">
          <h4 className={`text-sm font-pixel uppercase tracking-tight leading-tight transition-colors ${
            achievement.unlocked ? "text-white" : "text-text-secondary"
          }`}>
            {achievement.title}
          </h4>
          <p className="text-[11px] font-sans text-text-secondary leading-relaxed line-clamp-2">
            {achievement.description}
          </p>
        </div>

        {/* Progress System */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center text-[8px] font-pixel uppercase tracking-widest">
             <span className={achievement.unlocked ? `text-${accent}` : "text-text-secondary"}>
               {achievement.unlocked ? "PROTOCOL COMPLETED" : "SYNC PROGRESS"}
             </span>
             {!achievement.unlocked && achievement.requirementValue > 1 && (
               <span className="text-text-secondary">{achievement.progress} / {achievement.requirementValue}</span>
             )}
          </div>
          <div className="h-2 w-full bg-stone/50 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full bg-${accent} relative`}
            >
              {achievement.unlocked && (
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              )}
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Decorative background number/letter could go here if needed */}
      <div className={`absolute -bottom-2 -right-2 text-4xl font-pixel opacity-[0.03] select-none pointer-events-none ${achievement.unlocked ? `text-${accent}` : "text-white"}`}>
        {achievement.rarity[0].toUpperCase()}
      </div>
    </Card>
  );
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const categories = ["All", "Events", "Learning", "Projects", "Resources", "Community", "Elite", "Game Jams", "Hidden"];

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await fetch("/api/achievements");
        if (res.ok) {
          const data = await res.json();
          setAchievements(data);
        }
      } catch (err) {
        console.error("Failed to load achievements:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  const filteredAchievements = useMemo(() => {
    return achievements.filter(a => {
      const matchesCategory = filter === "All" || a.category === filter;
      const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || 
                            a.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [achievements, filter, search]);

  const stats = useMemo(() => {
    if (!achievements.length) return { percent: 0, unlocked: 0, totalXp: 0 };
    const unlocked = achievements.filter(a => a.unlocked);
    return {
      percent: (unlocked.length / achievements.length) * 100,
      unlocked: unlocked.length,
      totalXp: unlocked.reduce((sum, a) => sum + a.xpReward, 0)
    };
  }, [achievements]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pt-24 pb-20">
        <Section title="Achievement Vault" subtitle="progression & history" accent="sand">
          <div className="space-y-12">
            {/* Stats Overview */}
            <ScrollReveal direction="up">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card accent="sand" className="text-center space-y-2">
                  <p className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary">Vault Progress</p>
                  <div className="space-y-3">
                    <p className="text-3xl font-pixel text-white">{Math.round(stats.percent)}%</p>
                    <div className="h-1.5 w-full bg-stone/30 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.percent}%` }}
                        className="h-full bg-sand shadow-[0_0_10px_rgba(255,209,102,0.5)]"
                      />
                    </div>
                  </div>
                </Card>
                <Card accent="grass" className="text-center space-y-2">
                  <p className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary">Unlocked Badges</p>
                  <p className="text-4xl font-pixel text-white">{stats.unlocked.toString().padStart(2, '0')}<span className="text-sm opacity-30 ml-2">/ {achievements.length}</span></p>
                </Card>
                <Card accent="sky" className="text-center space-y-2">
                  <p className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary">Total Rewards</p>
                  <p className="text-4xl font-pixel text-white">{stats.totalXp}<span className="text-sm opacity-30 ml-2">XP</span></p>
                </Card>
              </div>
            </ScrollReveal>

            {/* Controls */}
            <div className="flex flex-col xl:flex-row gap-6 items-center justify-between bg-card/40 p-6 pixel-border">
              <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2">
                {categories.map(cat => (
                  <Button 
                    key={cat}
                    variant={filter === cat ? "sand" : "ghost"}
                    size="sm"
                    className="text-[8px] font-pixel h-9"
                    onClick={() => setFilter(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
              <div className="relative w-full xl:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
                <input 
                  type="text"
                  placeholder="SEARCH ARCHIVES..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-stone/20 border-2 border-border/50 py-3 pl-10 pr-4 font-pixel text-[10px] focus:border-sand focus:outline-none transition-colors uppercase"
                />
              </div>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <Card key={i} className="h-48 animate-pulse bg-stone/10 border-border/20"><div /></Card>
                ))
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredAchievements.map((achievement) => (
                    <motion.div
                      layout
                      key={achievement._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AchievementCard achievement={achievement} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {!loading && filteredAchievements.length === 0 && (
              <div className="text-center py-20 border-2 border-dashed border-border/30">
                <p className="text-text-secondary font-pixel text-xs uppercase tracking-widest">No matching records found in the vault.</p>
              </div>
            )}
          </div>
        </Section>
      </main>
    </div>
  );
}
