"use client";

import React from "react";
import { Gamepad2, Trophy, ArrowRight, Code } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScrollReveal } from "@/components/layout/ScrollReveal";

import { EventManagementModal } from "@/components/events/EventManagementModal";
import { useSession } from "next-auth/react";
import { IEvent } from "@/types";

export default function GameJamsPage() {
  const { data: session } = useSession();
  const [jams, setJams] = React.useState<IEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [managingJam, setManagingJam] = React.useState<IEvent | null>(null);

  const fetchJams = async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setJams(data.filter((e: IEvent) => e.type === "gamejam"));
      }
    } catch (err) {
      console.error("Failed to fetch game jams:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchJams();
  }, []);

  const handleAction = (jam: IEvent) => {
    const userRole = session?.user?.role || "";
    const adminRoles = ["Founder", "Core Architect", "architect"];

    if (adminRoles.includes(userRole)) {
      setManagingJam(jam);
    } else {
      // Regular user action
      alert("Project submission system coming soon! ⚡");
    }
  };

  const handleUpdate = (updated: IEvent) => {
    setJams(jams.map(j => j._id === updated._id ? updated : j));
  };

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
                        <Badge variant="grass">{jam.type}</Badge>
                        <span className="text-[10px] font-pixel text-text-secondary uppercase">
                          Starts {new Date(jam.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl uppercase group-hover:text-white transition-colors leading-tight font-pixel tracking-tighter">{jam.title}</h3>
                      
                      <p className="text-sm text-text-secondary font-sans leading-relaxed line-clamp-4">
                        {jam.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-grass/20">
                        <div className="flex items-center gap-2 text-[10px] uppercase font-pixel tracking-widest text-text-secondary">
                          <Trophy size={14} className="text-grass" /> {jam.players || "Open Entry"}
                        </div>
                        {jam.submissionDate && (
                          <div className={`flex items-center gap-2 text-[10px] uppercase font-pixel tracking-widest ${new Date(jam.submissionDate) < new Date() ? 'text-text-secondary opacity-50' : 'text-lava animate-pulse'}`}>
                            <Code size={14} /> {new Date(jam.submissionDate) < new Date() ? 'Ended' : 'Closing Soon'}
                          </div>
                        )}
                      </div>

                      {jam.submissionDate && (
                        <div className="mt-4 p-2 bg-grass/10 border border-grass/20 rounded text-[10px] font-pixel text-grass/80">
                          Deadline: {new Date(jam.submissionDate).toLocaleString(undefined, { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                    </div>
                    
                    <Button 
                        variant={(jam.submissionDate && new Date(jam.submissionDate) < new Date()) ? "secondary" : "grass"}
                        size="sm" 
                        className="w-full uppercase font-pixel text-[10px] tracking-widest"
                        onClick={() => handleAction(jam)}
                        disabled={!!(jam.submissionDate && new Date(jam.submissionDate) < new Date()) && !["Founder", "Core Architect", "architect"].includes(session?.user?.role || "")}
                      >
                        {["Founder", "Core Architect", "architect"].includes(session?.user?.role || "") ? "Manage Jam" : ((jam.submissionDate && new Date(jam.submissionDate) < new Date()) ? "Submissions Closed" : "Submit Project")}
                        <ArrowRight size={14} className="ml-2" />
                      </Button>

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

      {managingJam && (
        <EventManagementModal 
          event={managingJam} 
          onClose={() => setManagingJam(null)} 
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
