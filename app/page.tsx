"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Trophy, Users, Shield, Rocket, ExternalLink, Box } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* SECTION 1 — HERO */}
        <Section className="pt-32 md:pt-48 pb-20 relative overflow-visible">
          {/* Background Floating Island Concept Visual */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] opacity-20 pointer-events-none">
            <motion.div
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <div className="w-64 h-64 bg-grass/30 blur-3xl rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid grid-cols-4 gap-4">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="w-8 h-8 bg-stone/40 border border-white/10" />
                ))}
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-6xl md:text-9xl !leading-[0.8] text-white mb-4 uppercase tracking-tighter font-pixel">
                R.E.Y
              </h1>
              <p className="text-grass font-pixel text-[10px] md:text-xs uppercase tracking-[0.3em] mb-8">
                Explore • Create • Level Up
              </p>
              <p className="text-text-secondary text-lg md:text-xl max-w-xl mx-auto leading-relaxed font-sans">
                The ultimate destination for digital architects and competitive pioneers.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-6 pt-4"
            >
              <Button variant="grass" size="lg" className="px-10">
                Explore Projects <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
              <Button variant="secondary" size="lg" className="px-10">
                Join Club
              </Button>
            </motion.div>
          </div>
        </Section>

        {/* SECTION 2 — FEATURE CARDS */}
        <Section title="The Frontier" subtitle="latest updates" accent="sky">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card accent="lava">
               <div className="space-y-4">
                  <Badge variant="lava" icon={<Trophy size={10} />}>Upcoming Event</Badge>
                  <h3 className="text-xl uppercase">Skywars: Origins</h3>
                  <p className="text-text-secondary text-sm font-sans">
                    The classic battle returns. Compete for the title of Sky Architect this Saturday.
                  </p>
                  <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent text-lava">Learn More →</Button>
               </div>
            </Card>

            <Card accent="grass">
               <div className="space-y-4">
                  <Badge variant="grass" icon={<Box size={10} />}>Featured Project</Badge>
                  <h3 className="text-xl uppercase">The Great Library</h3>
                  <p className="text-text-secondary text-sm font-sans">
                    A massive community build project spanning 4,000 blocks. Contributed by 40+ members.
                  </p>
                  <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent text-grass">View Gallery →</Button>
               </div>
            </Card>

            <Card accent="sky">
               <div className="space-y-4">
                  <Badge variant="sky" icon={<Zap size={10} />}>Member Resources</Badge>
                  <h3 className="text-xl uppercase">V1 Asset Pack</h3>
                  <p className="text-text-secondary text-sm font-sans">
                    Exclusive textures and models for our registered Respawners and Architects.
                  </p>
                  <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent text-sky">Download Pack →</Button>
               </div>
            </Card>
          </div>
        </Section>

        {/* SECTION 3 — ROLE SYSTEM PREVIEW */}
        <Section title="Ranking System" subtitle="your path forward" accent="sand">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                name: "Spectator", 
                variant: "stone" as const, 
                desc: "The entry point. Watch events, explore public builds, and learn the R.E.Y way.",
                capabilities: ["Watch live events", "Public world access", "Community chat"]
              },
              { 
                name: "Respawner", 
                variant: "sky" as const, 
                desc: "Active members who participate in events and contribute to small-scale projects.",
                capabilities: ["Event participation", "Member resources", "Build rights"]
              },
              { 
                name: "Core Architect", 
                variant: "lava" as const, 
                desc: "The elite. Leading megaprojects and mentoring the next generation of builders.",
                capabilities: ["Lead megaprojects", "Governance voting", "Exclusive rewards"]
              }
            ].map((role, i) => (
              <Card key={i} accent={role.variant} className="flex flex-col h-full bg-card/50">
                <div className="space-y-6 flex-grow">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl uppercase">{role.name}</h3>
                    <Badge variant={role.variant}>{role.name === 'Core Architect' ? "ELITE" : "MEMBER"}</Badge>
                  </div>
                  <p className="text-text-secondary text-sm font-sans">
                    {role.desc}
                  </p>
                  <div className="space-y-2 pt-4">
                    <p className="text-[10px] uppercase text-text-secondary font-pixel tracking-widest">// Capabilities</p>
                    <ul className="space-y-2">
                       {role.capabilities.map((cap, j) => (
                         <li key={j} className="flex items-center gap-2 text-xs text-white">
                           <div className={`w-1 h-1 rounded-full bg-${role.variant}`} />
                           {cap}
                         </li>
                       ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {/* SECTION 4 — CTA */}
        <Section accent="grass" className="relative">
          <Card accent="grass" className="bg-grass/5 border-none p-12 md:p-24 text-center overflow-visible">
             <div className="max-w-2xl mx-auto space-y-8 relative z-10">
                <h2 className="text-4xl md:text-6xl uppercase leading-tight font-pixel">
                  Join <span className="text-grass">R.E.Y</span>
                </h2>
                <p className="text-text-secondary text-lg font-sans">
                  Become a part of the most ambitious digital collective. 
                  Start your journey from Spectator to Core Architect today.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                   <Button variant="grass" size="lg" className="w-full sm:w-auto px-16">
                      Join The Club
                   </Button>
                </div>
             </div>
             
             {/* Decorative Background Elements */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-grass/10 blur-3xl rounded-full -mr-32 -mt-32" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-grass/10 blur-3xl rounded-full -ml-32 -mb-32" />
          </Card>
        </Section>
      </main>

      <footer className="py-12 border-t-2 border-border/30 bg-background text-center">
        <Container>
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-2 group opacity-50 hover:opacity-100 transition-opacity uppercase font-pixel tracking-tighter">
              <Rocket className="w-6 h-6 text-grass" />
              <span className="text-lg text-white">R.E.Y</span>
            </div>
            <p className="text-text-secondary text-[10px] uppercase tracking-widest leading-loose font-pixel">
              &copy; 2026 R.E.Y COLLECTIVE. NOT AN OFFICIAL MINECRAFT PRODUCT.<br />
              BUILT FOR ARCHITECTS.
            </p>
            <div className="flex gap-8">
              {['Discord', 'Twitter', 'YouTube'].map(social => (
                <a key={social} href="#" className="font-pixel text-[8px] uppercase text-text-secondary hover:text-white transition-colors">
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
