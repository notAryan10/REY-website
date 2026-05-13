"use client";

import React from "react";
import { Calendar, MapPin, Users, ArrowRight, Trophy } from "lucide-react";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socket";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { EventManagementModal } from "@/components/events/EventManagementModal";
import { EventViewModal } from "@/components/events/EventViewModal";
import { IEvent } from "@/types";
import { formatFullDate } from "@/lib/format";

interface EventsClientProps {
  initialEvents: IEvent[];
}

export function EventsClient({ initialEvents }: EventsClientProps) {
  const { data: session } = useSession();
  const [events, setEvents] = React.useState<IEvent[]>(initialEvents);
  const [managingEvent, setManagingEvent] = React.useState<IEvent | null>(null);
  const [viewingEvent, setViewingEvent] = React.useState<IEvent | null>(null);

  React.useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, []);

  const handleJoinEvent = (event: IEvent) => {
    const userRole = session?.user?.role || "";
    const adminRoles = ["Founder", "Core Architect", "architect"];

    if (adminRoles.includes(userRole)) {
      setManagingEvent(event);
      return;
    }

    if (session?.user?.id) {
      socket.emit("xp:add", { userId: session.user.id, action: "event_join" });
      setViewingEvent(event);
    } else {
      alert("Please log in to join events.");
    }
  };

  const handleEventUpdate = (updatedEvent: IEvent) => {
    setEvents(events.map(ev => ev._id === updatedEvent._id ? updatedEvent : ev));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pt-24 pb-20">
        <Section title="Community Events" subtitle="gatherings & competitions" accent="lava">
          <ScrollReveal direction="up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
              {events.length > 0 ? (
                events.map((event, i) => (
                  <Card key={i} accent={event.accent || "lava"} className="group h-full flex flex-col">
                    <div className="space-y-4 flex-grow">
                      <div className="flex items-center justify-between">
                        <Badge variant={event.accent || "lava"}>{event.type}</Badge>
                        <span className="text-[10px] font-pixel text-text-secondary uppercase">
                          {formatFullDate(event.date)}
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
                        {event.submissionDate && (
                          <div className="flex items-center gap-2 text-[10px] uppercase font-pixel tracking-widest text-lava animate-pulse">
                            <Calendar size={12} /> Ends: {formatFullDate(event.submissionDate)}
                          </div>
                        )}
                      </div>

                      {event.leaderboard && event.leaderboard.length > 0 && (
                        <div className="mt-4 p-3 bg-stone/20 border border-border/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[8px] uppercase font-pixel text-text-secondary tracking-widest">Top Contenders</p>
                            <Trophy size={10} className="text-sand" />
                          </div>
                          <div className="space-y-1">
                            {event.leaderboard.slice(0, 3).sort((a, b) => a.rank - b.rank).map((entry, idx: number) => (
                              <div key={idx} className="flex justify-between text-[10px] font-sans">
                                <span className="text-white/90">#{entry.rank} {entry.playerName}</span>
                                <span className="text-sand font-pixel">{entry.score}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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

      {managingEvent && (
        <EventManagementModal 
          event={managingEvent} 
          onClose={() => setManagingEvent(null)} 
          onUpdate={handleEventUpdate}
        />
      )}

      {viewingEvent && (
        <EventViewModal 
          event={viewingEvent} 
          onClose={() => setViewingEvent(null)} 
        />
      )}
    </div>
  );
}
