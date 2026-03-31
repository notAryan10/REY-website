"use client";

import React from "react";
import { motion } from "framer-motion";
import { User, Shield, Zap, Trophy, LayoutDashboard, Settings } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

import { ScrollReveal } from "@/components/layout/ScrollReveal";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pt-24 pb-20">
        <Section title="Dashboard" subtitle="member portal" accent="sky">
           <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
              {/* Sidebar / Profile Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-1 space-y-6"
              >
                 <Card accent="sky" className="text-center space-y-6">
                    <div className="mx-auto w-24 h-24 bg-sky/10 border-2 border-sky/30 rounded-full flex items-center justify-center relative">
                       <User size={48} className="text-sky" />
                       <div className="absolute -bottom-2 -right-2 bg-grass p-2 rounded-full border-2 border-card">
                          <Zap size={16} className="text-white" />
                       </div>
                    </div>
                    <div>
                       <h3 className="text-xl uppercase">Aryan V.</h3>
                       <Badge variant="sky">Respawner ⚡</Badge>
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

              {/* Main Content Area */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-3 space-y-8"
              >
                 {/* Welcome Card */}
                 <Card accent="grass" className="bg-grass/5 border-grass/20 relative overflow-hidden">
                    <div className="space-y-4 relative z-10">
                       <h2 className="text-3xl uppercase leading-tight font-pixel">Welcome Back, <span className="text-grass">Respawner</span> ⚡</h2>
                       <p className="text-text-secondary text-sm font-sans max-w-xl">
                          Your reputation is growing. You are currently 45 XP away from reaching 
                          the Architect rank. Complete today's challenges to level up.
                       </p>
                       <div className="pt-4 flex gap-4">
                          <Button variant="grass" size="sm">Continue Building</Button>
                          <Button variant="secondary" size="sm">Daily Tasks</Button>
                       </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-grass/10 blur-3xl animate-pulse" />
                 </Card>

                 {/* Quick Stats Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stat Cards inherit the enhanced animation from the main container delay */}
                    <Card className="text-center space-y-2 border-border/50 group">
                       <p className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary group-hover:text-white transition-colors">Event Wins</p>
                       <p className="text-3xl font-pixel text-white">04</p>
                    </Card>
                    <Card className="text-center space-y-2 border-border/50 group">
                       <p className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary group-hover:text-white transition-colors">Projects Led</p>
                       <p className="text-3xl font-pixel text-white">02</p>
                    </Card>
                    <Card className="text-center space-y-2 border-border/50 group">
                       <p className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary group-hover:text-white transition-colors">Club XP</p>
                       <p className="text-3xl font-pixel text-white">2.4K</p>
                    </Card>
                 </div>

                 {/* Upcoming Task List Placeholder */}
                 <ScrollReveal direction="up">
                    <div className="space-y-4">
                       <h3 className="text-lg uppercase font-pixel tracking-tighter">Your Active Quests</h3>
                       <div className="space-y-4">
                          {[
                            { title: "Redstone Wiring Challenge", reward: "150 XP", status: "In Progress" },
                            { title: "Texture Submission v4", reward: "Special Badge", status: "Reviewing" }
                          ].map((quest, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-stone/20 border-2 border-border transition-all duration-300 hover:border-sky/50 hover:bg-stone/30 text-white group cursor-pointer">
                               <div className="flex items-center gap-4">
                                  <Shield size={20} className="text-sky group-hover:scale-110 transition-transform" />
                                  <div>
                                     <p className="text-sm font-sans">{quest.title}</p>
                                     <p className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary">{quest.reward}</p>
                                  </div>
                               </div>
                               <Badge variant={quest.status === "Reviewing" ? "sand" : "sky"}>{quest.status}</Badge>
                            </div>
                          ))}
                       </div>
                    </div>
                 </ScrollReveal>
              </motion.div>
           </div>
        </Section>
      </main>
    </div>
  );
}
