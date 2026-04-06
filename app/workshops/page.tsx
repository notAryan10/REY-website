"use client";

import React from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Lock, BookOpen, Clock, CheckCircle2 } from "lucide-react";
import { socket } from "@/lib/socket";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

import { ScrollReveal } from "@/components/layout/ScrollReveal";

export default function WorkshopsPage() {
  const { data: session, status } = useSession();
  const [workshops, setWorkshops] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    const fetchWorkshops = async () => {
      try {
        const res = await fetch("/api/workshops");
        if (res.ok) {
          const data = await res.json();
          setWorkshops(data);
        }
      } catch (err) {
        console.error("Failed to fetch workshops:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  const userRole = session?.user?.role || "spectator";
  
  // Workshops are restricted to Respawner and Architect
  // Workshops are restricted to Respawner and Architect
  const hasAccess = status === "authenticated" && (userRole === "respawner" || userRole === "architect");

  const handleAttendWorkshop = (workshop: any) => {
    if (session?.user?.id) {
       socket.emit("xp:add", { userId: (session.user as any).id, action: "workshop_attend" });
       alert(`Entering ${workshop.title}... +30 XP gained! 📚`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pt-24 pb-20">
        <Section title="Edu Workshops" subtitle="level up your skills" accent="sky">
          <ScrollReveal direction="up">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <Card key={i} className="h-[450px] animate-pulse bg-stone/10 border-border/50">
                    <div className="space-y-4">
                      <div className="h-6 w-20 bg-stone/20 rounded" />
                      <div className="h-10 w-3/4 bg-stone/20 rounded" />
                      <div className="h-24 w-full bg-stone/20 rounded" />
                    </div>
                  </Card>
                ))
              ) : workshops.length > 0 ? (
                workshops.map((workshop, i) => {
                  const isLocked = !hasAccess;
                  return (
                  <Card key={i} accent={workshop.accent || "sky"} className="flex flex-col h-full group relative overflow-hidden">
                    {/* Locked UI Overlay */}
                    {isLocked && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-background/80 backdrop-blur-xl z-20 flex flex-col items-center justify-center p-8 text-center space-y-6 transition-all duration-500 opacity-0 md:opacity-100"
                      >
                        <motion.div 
                          animate={{ 
                            rotate: [12, -12, 12],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="p-4 bg-lava/20 border border-lava/30 rounded-lg"
                        >
                           <Lock className="w-10 h-10 text-lava" />
                        </motion.div>
                        <div className="space-y-2">
                           <h4 className="text-xl uppercase font-pixel tracking-tighter">Classified Content</h4>
                           <p className="text-text-secondary text-[10px] uppercase font-pixel tracking-widest leading-loose">
                             {status === "unauthenticated" ? "Join the club to unlock edu modules." : "Respawner clearance required."}
                           </p>
                        </div>
                        {status === "unauthenticated" ? (
                          <Link href="/register" className="w-full">
                            <Button variant="lava" size="sm" className="w-full uppercase font-pixel text-[10px]">
                              Join REY Club
                            </Button>
                          </Link>
                        ) : (
                          <div className="space-y-2 w-full">
                            <Badge variant="lava" className="w-full justify-center py-2">Members Only</Badge>
                            <p className="text-[8px] uppercase text-lava/60 font-pixel">Restricted Access</p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    <div className="space-y-4 flex-grow relative z-10">
                      <div className="flex items-center justify-between">
                        <Badge variant={workshop.accent || "sky"}>Workshop</Badge>
                        <span className="text-[10px] font-pixel text-text-secondary uppercase">
                          {new Date(workshop.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <h3 className="text-xl uppercase leading-tight group-hover:text-white transition-colors">{workshop.title}</h3>
                      
                      <p className="text-sm text-text-secondary line-clamp-3 font-sans leading-relaxed">
                        {workshop.description}
                      </p>
                      
                      <div className="flex items-center gap-4 pt-4 text-[10px] uppercase font-pixel tracking-widest text-text-secondary border-t border-border/30">
                        <div className="flex items-center gap-2"><Clock size={12} className="text-sky" /> Advanced</div>
                        <div className="flex items-center gap-2"><CheckCircle2 size={12} className="text-grass" /> Certificate</div>
                      </div>
                    </div>
                    
                    {!isLocked && (
                      <div className="pt-8 w-full relative z-10">
                        <Button 
                          onClick={() => handleAttendWorkshop(workshop)}
                          variant={workshop.accent || "sky"} 
                          size="sm" 
                          className="w-full uppercase font-pixel text-[10px] tracking-widest"
                        >
                          Enter Module <BookOpen className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {/* Background Detail */}
                    <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                       <BookOpen size={120} />
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-border/50 rounded-xl bg-stone/5">
                 <p className="font-pixel text-text-secondary uppercase tracking-[0.2em] text-sm">No Active Workshops Found</p>
              </div>
            )}
            </div>
          </ScrollReveal>
        </Section>
      </main>
    </div>
  );
}
