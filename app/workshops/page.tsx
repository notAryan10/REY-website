"use client";

import React from "react";
import { Lock, BookOpen, GraduationCap, Clock, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function WorkshopsPage() {
  const workshops = [
    {
      title: "Mastering Redstone logic",
      isLocked: false,
      lessons: "12 Lessons",
      level: "Intermediate",
      time: "4h 20m",
      accent: "sky" as const,
    },
    {
      title: "Mega-Build Planning",
      isLocked: true,
      lessons: "24 Lessons",
      level: "Advanced",
      time: "8h 45m",
      accent: "grass" as const,
    },
    {
      title: "Command Block Mastery",
      isLocked: true,
      lessons: "18 Lessons",
      level: "Elite",
      time: "6h 15m",
      accent: "lava" as const,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20">
        <Section title="Edu Workshops" subtitle="level up your skills" accent="sky">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
             {workshops.map((workshop, i) => (
               <Card key={i} accent={workshop.accent} className="flex flex-col h-full group relative overflow-hidden">
                 {/* Locked UI Overlay */}
                 {workshop.isLocked && (
                   <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center space-y-6">
                      <div className="p-4 bg-lava/20 border border-lava/30 rotate-12 scale-125">
                         <Lock className="w-10 h-10 text-lava" />
                      </div>
                      <div className="space-y-4">
                         <h4 className="text-xl uppercase font-pixel tracking-tighter">Locked Content</h4>
                         <p className="text-text-secondary text-xs uppercase font-pixel tracking-widest leading-loose">
                           Access restricted to Respawner rank & above.
                         </p>
                      </div>
                      <Button variant="lava" size="sm" className="w-full">
                        Upgrade To Unlock
                      </Button>
                   </div>
                 )}

                 <div className="space-y-6 flex-grow">
                   <div className="flex items-center justify-between">
                     <Badge variant={workshop.accent}>{workshop.level}</Badge>
                     <span className="text-[10px] font-pixel text-text-secondary uppercase">{workshop.lessons}</span>
                   </div>
                   
                   <h3 className="text-xl uppercase leading-tight group-hover:text-white transition-colors">{workshop.title}</h3>
                   
                   <div className="grid grid-cols-2 gap-4 text-[10px] uppercase font-pixel tracking-widest text-text-secondary">
                      <div className="flex items-center gap-2"><Clock size={12} className={`text-${workshop.accent}`} /> {workshop.time}</div>
                      <div className="flex items-center gap-2"><CheckCircle2 size={12} className={`text-${workshop.accent}`} /> Premium</div>
                   </div>
                   
                   <div className="pt-6 border-t border-border/50 flex flex-col gap-4">
                      <div className="flex -space-x-2">
                        {[...Array(4)].map((_, j) => (
                          <div key={j} className="w-8 h-8 rounded-full border-2 border-card bg-stone/50 overflow-hidden" />
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-card bg-stone/80 text-[8px] flex items-center justify-center text-white">+120</div>
                      </div>
                      <p className="text-[10px] uppercase text-text-secondary tracking-widest">// Architects Learning</p>
                   </div>
                 </div>
                 
                 {!workshop.isLocked && (
                   <div className="pt-8 w-full">
                     <Button variant={workshop.accent} size="sm" className="w-full">
                       Start Workshop <BookOpen className="ml-2 w-4 h-4" />
                     </Button>
                   </div>
                 )}
               </Card>
             ))}
           </div>
        </Section>
      </main>
    </div>
  );
}
