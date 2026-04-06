"use client";

import React from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { User, Shield, Zap, Trophy, LayoutDashboard, Settings } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { AdminCMS } from "@/components/dashboard/AdminCMS";
import { UserXP } from "@/components/ui/UserXP";
import { LeaderboardCard } from "@/components/dashboard/LeaderboardCard";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchProfile();
    }
  }, [session]);

  const userName = session?.user?.name || "Member";
  const userRole = session?.user?.role || "spectator";
  const xp = profile?.xp || 0;
  const eventWins = profile?.eventWins || 0;
  const projectsLed = profile?.projectsLed || 0;
  const quests = profile?.quests || [];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pt-24 pb-20">
        <Section title="Dashboard" subtitle="member portal" accent="sky">
           <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-1 space-y-6"
              >
                 <Card accent="sky" className="text-center space-y-8 p-8 bg-card/40 backdrop-blur-md border-2 hover:shadow-[0_0_30px_rgba(91,192,235,0.15)] transition-all duration-500">
                    <div className="mx-auto w-28 h-28 bg-sky/10 border-2 border-sky/30 rounded-sm flex items-center justify-center relative group-hover:border-sky transition-colors">
                       <User size={56} className="text-sky/80 group-hover:text-sky transition-colors" />
                       <motion.div 
                         initial={{ scale: 0 }}
                         animate={{ scale: 1 }}
                         className="absolute -bottom-2 -right-2 bg-grass p-2.5 rounded-sm border-2 border-card shadow-lg"
                       >
                          <Zap size={18} className="text-white" />
                       </motion.div>
                    </div>
                    <div className="space-y-4">
                       <h3 className="text-2xl uppercase tracking-tighter text-white">{userName}</h3>
                       <div className="flex flex-col items-center gap-3">
                         <Badge variant="sky" className="px-4 py-1.5">{userRole}</Badge>
                         <UserXP level={4} xp={750} nextLevelXp={1000} showDetails />
                       </div>
                    </div>
                    <div className="pt-4 border-t border-border/50 space-y-4">
                       <Button variant="ghost" size="sm" className="w-full justify-start">
                          <LayoutDashboard size={14} className="mr-3" /> Overview
                       </Button>
                       <Button variant="ghost" size="sm" className="w-full justify-start text-text-secondary">
                          <Trophy size={14} className="mr-3" /> Achievements
                       </Button>
                       <Button variant="ghost" size="sm" className="w-full justify-start text-text-secondary">
                          <Settings size={14} className="mr-3" /> Settings
                       </Button>
                    </div>
                 </Card>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-3 space-y-8"
              >
                 <Card accent="grass" className="bg-grass/5 border-grass/20 relative overflow-hidden">
                    <div className="space-y-4 relative z-10">
                       <h2 className="text-3xl uppercase leading-tight font-pixel">Welcome Back, <span className="text-grass">{userRole}</span> ⚡</h2>
                       <p className="text-text-secondary text-sm font-sans max-w-xl">
                          Your reputation is growing. You are currently {500 - (xp % 500)} XP away from reaching 
                          the next level. Complete today's challenges to level up.
                       </p>
                       <div className="pt-4 flex gap-4">
                          <Button variant="grass" size="sm">Continue Building</Button>
                          <Button variant="secondary" size="sm">Daily Tasks</Button>
                       </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-grass/10 blur-3xl animate-pulse" />
                 </Card>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="text-center space-y-2 border-border/50 group">
                       <p className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary group-hover:text-white transition-colors">Event Wins</p>
                       <p className="text-3xl font-pixel text-white">{eventWins.toString().padStart(2, '0')}</p>
                    </Card>
                    <Card className="text-center space-y-2 border-border/50 group">
                       <p className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary group-hover:text-white transition-colors">Projects Led</p>
                       <p className="text-3xl font-pixel text-white">{projectsLed.toString().padStart(2, '0')}</p>
                    </Card>
                    <Card className="text-center space-y-2 border-border/50 group">
                       <p className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary group-hover:text-white transition-colors">Club XP</p>
                       <p className="text-3xl font-pixel text-white">{xp >= 1000 ? `${(xp / 1000).toFixed(1)}K` : xp}</p>
                    </Card>
                 </div>

                 <ScrollReveal direction="up">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <h3 className="text-lg uppercase font-pixel tracking-tighter">Your Active Quests</h3>
                          <div className="space-y-4">
                             {quests.length > 0 ? (
                               quests.map((quest: any, i: number) => (
                                 <div key={i} className="flex items-center justify-between p-4 bg-stone/20 border-2 border-border transition-all duration-300 hover:border-sky/50 hover:bg-stone/30 text-white group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                       <Shield size={20} className="text-sky group-hover:scale-110 transition-transform" />
                                       <div>
                                          <p className="text-sm font-sans">{quest.title}</p>
                                          <p className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary">{quest.reward}</p>
                                       </div>
                                    </div>
                                    <Badge variant={quest.status === "Reviewing" ? "sand" : quest.status === "Completed" ? "grass" : "sky"}>{quest.status}</Badge>
                                 </div>
                               ))
                             ) : (
                               <div className="p-8 text-center border-2 border-dashed border-border/50 text-text-secondary font-pixel text-xs uppercase tracking-widest">
                                  No Active Quests Found
                                </div>
                             )}
                          </div>
                       </div>
                       
                       <div className="space-y-4">
                          <LeaderboardCard />
                       </div>
                    </div>
                 </ScrollReveal>

                 {userRole === "architect" && (
                   <ScrollReveal direction="up" delay={0.4}>
                     <div className="pt-8 space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="h-[2px] flex-grow bg-lava/20" />
                           <h3 className="text-lg uppercase font-pixel tracking-tighter text-lava">Architect Controls</h3>
                           <div className="h-[2px] flex-grow bg-lava/20" />
                        </div>
                        <AdminCMS />
                     </div>
                   </ScrollReveal>
                 )}
              </motion.div>
           </div>
        </Section>
      </main>
    </div>
  );
}
