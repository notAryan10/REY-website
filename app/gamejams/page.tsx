"use client";

import React from "react";
import { Zap, Trophy, Clock, Swords } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function GameJamsPage() {
  const jams = [
    {
      title: "Megaproject Mashup",
      status: "Ongoing",
      statusVariant: "grass" as const,
      timeLeft: "2 Days Left",
      participants: "45 Teams",
      prize: "Exclusive Rank + $250 Store Credit",
      accent: "grass" as const,
    },
    {
      title: "Redstone Innovation",
      status: "Upcoming",
      statusVariant: "sky" as const,
      timeLeft: "Starts In 5 Days",
      participants: "120 Registered",
      prize: "Specialized Badge + Discord Role",
      accent: "sky" as const,
    },
    {
      title: "PVP Arena Design",
      status: "Completed",
      statusVariant: "stone" as const,
      timeLeft: "Ended Oct 15",
      participants: "80 Entries",
      prize: "Winners Featured on Lobby",
      accent: "stone" as const,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 pt-24">
        <Section title="Game Jams" subtitle="competitive build challenges" accent="grass">
          <div className="space-y-8 pt-8">
            {jams.map((jam, i) => (
              <Card key={i} accent={jam.accent} className="relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className={`p-6 bg-${jam.accent}/10 border border-${jam.accent}/20 rotate-3 group-hover:rotate-0 transition-transform`}>
                    <Swords className={`w-12 h-12 text-${jam.accent}`} />
                  </div>
                  
                  <div className="flex-1 space-y-4 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                       <h3 className="text-2xl uppercase">{jam.title}</h3>
                       <Badge variant={jam.statusVariant}>{jam.status}</Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs text-text-secondary uppercase font-pixel tracking-widest">
                       <span className="flex items-center gap-2"><Clock size={14} className={`text-${jam.accent}`} /> {jam.timeLeft}</span>
                       <span className="flex items-center gap-2"><Zap size={14} className={`text-${jam.accent}`} /> {jam.participants}</span>
                    </div>
                    
                    <div className="p-4 bg-white/5 border border-white/10 text-xs font-sans text-text-secondary">
                       <span className={`text-${jam.accent} font-pixel uppercase text-[10px]`}>// PRIZE POOL:</span> {jam.prize}
                    </div>
                  </div>
                  
                  <div className="w-full md:w-auto">
                    <Button variant={jam.accent === 'stone' ? 'secondary' : jam.accent} className="w-full md:w-auto px-8">
                       {jam.status === 'Completed' ? "View Results" : "Enter Jam"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      </main>
    </div>
  );
}
