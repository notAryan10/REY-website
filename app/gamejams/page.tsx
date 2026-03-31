"use client";

import React from "react";
import { motion } from "framer-motion";
import { Gamepad2, Trophy, ArrowRight, Code } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScrollReveal } from "@/components/layout/ScrollReveal";

export default function GameJamsPage() {
  const [jams, setJams] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchJams = async () => {
      try {
        const res = await fetch("/api/events");
        if (res.ok) {
          const data = await res.json();
          setJams(data.filter((e: any) => e.type === "gamejam"));
        }
      } catch (err) {
        console.error("Failed to fetch game jams:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJams();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pt-24 pb-20">
        <Section title="Game Jams" subtitle="create. compete. win." accent="grass">
          <ScrollReveal direction="up">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <Card key={i} className="h-80 animate-pulse bg-stone/10 border-border/50">
                    <div />
                  </Card>
                ))
              ) : jams.length > 0 ? (
                jams.map((jam, i) => (
                  <Card key={i} accent="grass" className="group h-full flex flex-col relative overflow-hidden bg-grass/5 border-grass/20">
                    <div className="space-y-4 flex-grow relative z-10">
                      <div className="flex items-center justify-between">
                        <Badge variant="grass">Annual Jam</Badge>
                        <span className="text-[10px] font-pixel text-text-secondary uppercase">
                          Starts {new Date(jam.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl uppercase group-hover:text-white transition-colors leading-tight font-pixel tracking-tighter">{jam.title}</h3>
                      
                      <p className="text-sm text-text-secondary font-sans leading-relaxed line-clamp-4">
                        {jam.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-grass/20">
                        <div className="flex items-center gap-2 text-[10px] uppercase font-pixel tracking-widest text-grass">
                          <Trophy size={14} /> $500 Prize
                        </div>
                        <div className="flex items-center gap-2 text-[10px] uppercase font-pixel tracking-widest text-grass">
                          <Code size={14} /> 48 Hours
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-8 w-full relative z-10">
                      <Button variant="grass" size="sm" className="w-full uppercase font-pixel text-[10px] tracking-widest">
                        Submit Project <ArrowRight size={14} className="ml-2" />
                      </Button>
                    </div>

                    <div className="absolute -bottom-6 -right-6 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
                       <Gamepad2 size={120} className="text-grass" />
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-border/50 rounded-xl bg-stone/5">
                   <p className="font-pixel text-text-secondary uppercase tracking-[0.2em] text-sm">No Active Game Jams Found</p>
                </div>
              )}
            </div>
          </ScrollReveal>
        </Section>
      </main>
    </div>
  );
}
