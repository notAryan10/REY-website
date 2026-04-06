"use client";

import React from "react";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socket";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScrollReveal } from "@/components/layout/ScrollReveal";

export default function EventsPage() {
  const { data: session } = useSession();
  const [events, setEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleJoinEvent = (event: any) => {
    if (session?.user?.id) {
      socket.emit("xp:add", { userId: (session.user as any).id, action: "event_join" });
      alert(`Joined ${event.title}! +20 XP incoming... ⚡`);
    } else {
      alert("Please log in to join events.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pt-24 pb-20">
        <Section title="Community Events" subtitle="gatherings & competitions" accent="lava">
          <ScrollReveal direction="up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <Card key={i} className="h-64 animate-pulse bg-stone/10 border-border/50"><div /></Card>
                ))
              ) : events.length > 0 ? (
                events.map((event, i) => (
                  <Card key={i} accent={event.accent || "lava"} className="group h-full flex flex-col">
                    <div className="space-y-4 flex-grow">
                      <div className="flex items-center justify-between">
                        <Badge variant={event.accent || "lava"}>{event.type}</Badge>
                        <span className="text-[10px] font-pixel text-text-secondary uppercase">
                          {new Date(event.date).toLocaleDateString(undefined, { 
                            weekday: 'short',
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl uppercase group-hover:text-white transition-colors leading-tight">{event.title}</h3>
                      
                      <p className="text-sm text-text-secondary font-sans leading-relaxed line-clamp-3">
                        {event.description}
                      </p>

                      <div className="flex flex-wrap gap-4 pt-2 border-t border-border/30">
                        <div className="flex items-center gap-2 text-[10px] uppercase font-pixel tracking-widest text-text-secondary">
                          <MapPin size={12} className={`text-${event.accent || "lava"}`} /> {event.location || "Club HQ"}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] uppercase font-pixel tracking-widest text-text-secondary">
                          <Users size={12} className={`text-${event.accent || "lava"}`} /> {event.players || "Open Entry"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6 flex justify-end">
                      <Button 
                        variant={event.accent || "lava"} 
                        size="sm" 
                        className="group/btn uppercase font-pixel text-[10px] tracking-widest"
                        onClick={() => handleJoinEvent(event)}
                      >
                        Join Event <ArrowRight size={14} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-border/50 rounded-xl bg-lava/5">
                   <p className="font-pixel text-text-secondary uppercase tracking-[0.2em] text-sm">No Events Scheduled At This Time</p>
                </div>
              )}
            </div>
          </ScrollReveal>
        </Section>
      </main>
    </div>
  );
}
