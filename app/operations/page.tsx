"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { 
  Target, 
  Terminal, 
  Lock,
} from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

import { QuestCard } from "@/components/operations/QuestCard";
import { StatsOverview } from "@/components/operations/StatsOverview";
import { ActivityFeed } from "@/components/operations/ActivityFeed";
import { IUserQuest, IStreak } from "@/types";

export default function OperationsPage() {
  const { data: session } = useSession();
  const [quests, setQuests] = useState<IUserQuest[]>([]);
  const [streak, setStreak] = useState<IStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [xpPopups, setXpPopups] = useState<{ id: number, amount: number }[]>([]);

  const categories = [
    "All",
    "Login",
    "Events",
    "Resources",
    "Projects",
    "Community",
    "Elite",
    "Hidden"
  ];

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [questsRes, streakRes] = await Promise.all([
        fetch("/api/quests/daily"),
        fetch("/api/quests/streak")
      ]);

      if (questsRes.ok) {
        const newQuests: IUserQuest[] = await questsRes.json();
        
        setQuests(prevQuests => {
          // Find newly completed quests to show XP popups
          newQuests.forEach((nq) => {
              const oldQ = prevQuests.find(oq => oq._id === nq._id);
              if (oldQ && !oldQ.completed && nq.completed) {
                  const id = Date.now() + Math.random();
                  setXpPopups(prev => [...prev, { id, amount: nq.questId.xpReward }]);
                  setTimeout(() => {
                      setXpPopups(prev => prev.filter(p => p.id !== id));
                  }, 2000);
              }
          });
          return newQuests;
        });
      }
      if (streakRes.ok) setStreak(await streakRes.json());
    } catch (err) {
      console.error("Failed to fetch operations data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session, fetchData]);

  const filteredQuests = quests.filter(uq => {
    if (!uq.questId) return false;
    if (activeCategory === "All") return true;
    return uq.questId.category.toLowerCase() === activeCategory.toLowerCase();
  });

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <Card accent="lava" className="max-w-md text-center">
          <Lock className="mx-auto text-lava mb-4" size={48} />
          <h2 className="text-xl font-pixel mb-2">Access Denied</h2>
          <p className="text-text-secondary text-sm mb-6">You must be synchronized with the network to access daily operations.</p>
          <Button variant="lava" onClick={() => window.location.href = "/login"}>Initialize Login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-architect-bg text-white pb-20">
      <main className="pt-24">
        <Section 
          title="DAILY OPERATIONS" 
          subtitle="realtime progression objectives" 
          accent="grass"
        >
          <Container>
            {/* Hero Description */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mb-12"
            >
              <p className="text-text-secondary text-sm leading-relaxed font-sans">
                Complete missions, gain XP, unlock achievements, and evolve through the R.E.Y network.
                Missions refresh daily at 00:00. Maintain your sync streak for elite rewards.
              </p>
            </motion.div>

            {/* Stats Overview */}
            <StatsOverview 
              quests={quests} 
              streak={streak} 
              loading={loading} 
            />

            {/* Category Navigation */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-[10px] font-pixel tracking-tighter transition-all rounded-sm border ${
                    activeCategory === cat 
                      ? "bg-architect-green text-black border-architect-green shadow-[0_0_15px_rgba(82,208,83,0.3)]" 
                      : "bg-white/5 text-text-secondary border-white/10 hover:border-white/20"
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Quest Grid */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-pixel text-white/80 flex items-center gap-2">
                    <Target size={18} className="text-architect-green" />
                    ACTIVE OBJECTIVES
                  </h3>
                  <Badge variant="stone" className="text-[9px]">
                    {filteredQuests.length} MISSIONS LOGGED
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                      Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-48 bg-white/5 animate-pulse rounded-lg border border-white/10" />
                      ))
                    ) : filteredQuests.length > 0 ? (
                      filteredQuests.map((uq) => (
                        <QuestCard 
                          key={uq._id} 
                          userQuest={uq} 
                          onComplete={fetchData} 
                        />
                      ))
                    ) : (
                      <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-lg opacity-40">
                        <Terminal size={48} className="mx-auto mb-4 text-text-secondary" />
                        <p className="font-pixel text-[10px] uppercase">No missions found in this sector</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Activity Feed */}
              <div className="lg:col-span-1">
                <ActivityFeed />
              </div>
            </div>

            {/* XP Popups Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[200] flex items-center justify-center">
                <AnimatePresence>
                    {xpPopups.map((popup) => (
                        <motion.div
                            key={popup.id}
                            initial={{ opacity: 0, y: 20, scale: 0.5 }}
                            animate={{ opacity: 1, y: -100, scale: 1.5 }}
                            exit={{ opacity: 0, scale: 2 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute font-pixel text-architect-gold text-2xl drop-shadow-[0_0_15px_rgba(246,196,83,0.8)]"
                        >
                            +{popup.amount} XP
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
          </Container>
        </Section>
      </main>
    </div>
  );
}
