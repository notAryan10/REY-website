"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Trophy, Users, Shield, Rocket } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1">
        <Section className="pt-32 md:pt-48 pb-20">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} >
              <Badge variant="grass" icon={<Rocket size={12} />} className="mb-4">
                Now Live: Skywars Season 4
              </Badge>
              <h1 className="text-4xl md:text-7xl !leading-tight text-white mb-6 uppercase tracking-tighter">
                Unleash Your <span className="text-grass">Creativity</span> In The Ultimate World.
              </h1>
              <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Join the most vibrant Minecraft community. Participate in epic events, 
                collaborate on massive builds, and compete for legendary rewards.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex flex-wrap items-center justify-center gap-4 pt-4" >
              <Button variant="grass" size="lg" className="px-10">
                Join Server <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button variant="secondary" size="lg" className="px-10">
                Explore Events
              </Button>
            </motion.div>

            <div className="relative w-full h-24 mt-12 overflow-hidden pointer-events-none">
               {[...Array(6)].map((_, i) => (
                 <motion.div
                  key={i} animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0]}}
                  transition={{ duration: 3 + i, repeat: Infinity,ease: "easeInOut"}}
                  className="absolute w-8 h-8 opacity-20 border-2 border-grass"
                  style={{ left: `${15 + (i * 15)}%`,top: `${20 + (i % 3 * 20)}%`}}
                 />
               ))}
            </div>
          </div>
        </Section>

        <Section className="py-12 border-y-2 border-border/50 bg-stone/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Players Online", value: "240+", icon: <Users className="w-5 h-5 text-sky" /> },
              { label: "Active Events", value: "12", icon: <Trophy className="w-5 h-5 text-lava" /> },
              { label: "Worlds Created", value: "1,450", icon: <Zap className="w-5 h-5 text-sand" /> },
              { label: "Global Ranking", value: "#14", icon: <Shield className="w-5 h-5 text-grass" /> },
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-text-secondary text-[10px] uppercase font-pixel tracking-widest">
                  {stat.icon} {stat.label}
                </div>
                <div className="text-3xl font-pixel text-white">{stat.value}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Community Highlights"  subtitle="what's happening now"  accent="sky" className="bg-background" >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            <Card accent="grass" className="h-full">
              <div className="space-y-6 flex flex-col h-full">
                <div className="p-3 w-fit bg-grass/20 border border-grass/30">
                  <Trophy className="w-8 h-8 text-grass" />
                </div>
                <div className="space-y-2 flex-grow">
                   <h3 className="text-xl uppercase">Elite Tournaments</h3>
                   <p className="text-text-secondary text-sm leading-relaxed font-sans">
                     Weekly competitive events across multiple game modes. 
                     Win exclusive cosmetic ranks and real rewards.
                   </p>
                </div>
                <Button variant="ghost" size="sm" className="w-fit self-start">View Calendar</Button>
              </div>
            </Card>

            <Card accent="lava" className="h-full">
              <div className="space-y-6 flex flex-col h-full">
                <div className="p-3 w-fit bg-lava/20 border border-lava/30">
                  <Users className="w-8 h-8 text-lava" />
                </div>
                <div className="space-y-2 flex-grow">
                   <h3 className="text-xl uppercase">Creative Guilds</h3>
                   <p className="text-text-secondary text-sm leading-relaxed font-sans">
                     Collaborate on massive megaprojects with the world's 
                     most talented architects and redstone engineers.
                   </p>
                </div>
                <Button variant="ghost" size="sm" className="w-fit self-start">Find a Guild</Button>
              </div>
            </Card>

            <Card accent="sky" className="h-full">
              <div className="space-y-6 flex flex-col h-full">
                <div className="p-3 w-fit bg-sky/20 border border-sky/30">
                  <Zap className="w-8 h-8 text-sky" />
                </div>
                <div className="space-y-2 flex-grow">
                   <h3 className="text-xl uppercase">Custom Resources</h3>
                   <p className="text-text-secondary text-sm leading-relaxed font-sans">
                     Access our curated database of high-quality textures, 
                     models, and plugins to enhance your gameplay.
                   </p>
                </div>
                <Button variant="ghost" size="sm" className="w-fit self-start">Browse Packs</Button>
              </div>
            </Card>
          </div>
        </Section>

        <Section accent="lava" className="bg-lava/5 border-t-2 border-border/50">
          <Card accent="lava" className="bg-lava/10 border-none p-12 text-center md:p-20 overflow-visible">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-8 relative z-10" >
              <h2 className="text-3xl md:text-5xl uppercase leading-tight">
                Ready to Join the <span className="text-lava">Revolution?</span>
              </h2>
              <p className="text-text-secondary text-lg max-w-xl mx-auto">
                Stop playing alone. Join 10,000+ players in the most 
                ambitious Minecraft community on the planet.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button variant="lava" size="lg" className="w-full sm:w-auto px-12">
                  Launch REY Server
                </Button>
                <div className="flex items-center gap-3 text-text-secondary text-[10px] uppercase font-pixel tracking-tighter">
                  <span className="flex h-2 w-2 rounded-full bg-grass animate-pulse" />
                  play.rey.net - 2.4K online
                </div>
              </div>
            </motion.div>
            
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-lava/20 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-lava/20 blur-3xl rounded-full" />
          </Card>
        </Section>
      </main>

      <footer className="py-12 border-t-2 border-border/30 bg-background text-center">
        <Container>
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-2 group opacity-50 hover:opacity-100 transition-opacity">
              <Rocket className="w-6 h-6 text-grass" />
              <span className="font-pixel text-lg tracking-tighter text-white">R.E.Y</span>
            </div>
            <p className="text-text-secondary text-[10px] uppercase tracking-widest leading-loose">
              &copy; 2026 REY COMMUNITY. NOT AN OFFICIAL MINECRAFT PRODUCT.<br />
              POWERED BY THE REY DESIGN SYSTEM.
            </p>
            <div className="flex gap-8">
              {['Discord', 'Twitter', 'YouTube'].map(social => (
                <a key={social} href="#" className="font-pixel text-[8px] uppercase text-text-secondary hover:text-white">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
