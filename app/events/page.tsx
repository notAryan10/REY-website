"use client";

import React from "react";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

import { ScrollReveal } from "@/components/layout/ScrollReveal";

export default function EventsPage() {
  const events = [
    {
      title: "Skywars Origins",
      date: "Oct 24, 2026",
      location: "Event Server 1",
      players: "64/100",
      type: "Tournament",
      accent: "lava" as const,
    },
    {
      title: "Creative Showcase",
      date: "Oct 28, 2026",
      location: "Creative Hub",
      players: "120/500",
      type: "Exhibition",
      accent: "grass" as const,
    },
    {
      title: "Redstone Summit",
      date: "Nov 02, 2026",
      location: "Workshop World",
      players: "32/50",
      type: "Workshop",
      accent: "sky" as const,
    },
    {
      title: "Base Defense League",
      date: "Nov 10, 2026",
      location: "PVP Realm",
      players: "0/200",
      type: "League",
      accent: "lava" as const,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pt-24 pb-20">
        <Section title="Community Events" subtitle="gatherings & competitions" accent="lava">
          <ScrollReveal direction="up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
              {events.map((event, i) => (
                <Card key={i} accent={event.accent} className="group">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className={`w-full md:w-32 h-32 bg-${event.accent}/10 border border-${event.accent}/20 flex items-center justify-center`}>
                      <Calendar className={`w-10 h-10 text-${event.accent}`} />
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant={event.accent}>{event.type}</Badge>
                        <span className="text-[10px] font-pixel text-text-secondary uppercase">{event.date}</span>
                      </div>
                      
                      <h3 className="text-2xl uppercase group-hover:text-white transition-colors">{event.title}</h3>
                      
                      <div className="flex flex-wrap gap-4 pt-2">
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <MapPin size={14} className={`text-${event.accent}`} /> {event.location}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <Users size={14} className={`text-${event.accent}`} /> {event.players}
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-border/50 flex justify-end">
                        <Button variant={event.accent} size="sm" className="group/btn">
                          View Details <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollReveal>
        </Section>
      </main>
    </div>
  );
}
