"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, Calendar, Trophy, MapPin, Users, Link as LinkIcon, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

import { IEvent } from "@/types";
import { formatFullDate } from "@/lib/format";

interface EventViewModalProps {
  event: IEvent;
  onClose: () => void;
}

export function EventViewModal({ event: initialEvent, onClose }: EventViewModalProps) {
  const [event, setEvent] = React.useState<IEvent>(initialEvent);
  const [syncing, setSyncing] = React.useState(false);

  React.useEffect(() => {
    setEvent(initialEvent);
  }, [initialEvent]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`/api/events/${event._id}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
      }
    } catch {
      console.error("Sync failed:");
    } finally {
      setTimeout(() => setSyncing(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <Card accent={event.accent || "lava"} className="relative overflow-hidden">
          {/* Animated Background Element */}
          <div className={`absolute -top-24 -right-24 w-64 h-64 bg-${event.accent || 'lava'}/10 blur-[100px] rounded-full`} />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-text-secondary hover:text-white transition-colors z-10"
          >
            <X size={20} />
          </button>

          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant={event.accent || "lava"} className="font-pixel text-[10px] uppercase tracking-widest px-3 py-1">
                  {event.type}
                </Badge>
                <div className="h-[1px] flex-grow bg-border/30" />
              </div>
              
              <h2 className="text-4xl md:text-5xl uppercase font-pixel tracking-tighter text-white leading-none">
                {event.title}
              </h2>

              <div className="flex flex-wrap gap-6 pt-2">
                <div className="flex items-center gap-2 text-[10px] uppercase font-pixel tracking-widest text-text-secondary">
                  <Calendar size={14} className={`text-${event.accent || "lava"}`} /> 
                  {formatFullDate(event.date)}
                </div>
                <div className="flex items-center gap-2 text-[10px] uppercase font-pixel tracking-widest text-text-secondary">
                  <MapPin size={14} className={`text-${event.accent || "lava"}`} /> {event.location || "Club HQ"}
                </div>
                <div className="flex items-center gap-2 text-[10px] uppercase font-pixel tracking-widest text-text-secondary">
                  <Users size={14} className={`text-${event.accent || "lava"}`} /> {event.players || "Open Entry"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xs uppercase font-pixel tracking-[0.2em] text-text-secondary">Briefing</h3>
                  <p className="text-sm text-text-secondary font-sans leading-relaxed">
                    {event.description}
                  </p>
                </div>

                {event.submissionDate && (
                  <Card className={`${new Date(event.submissionDate) < new Date() ? 'bg-stone/10 border-stone/30' : 'bg-lava/5 border-lava/20'} border-dashed`}>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className={`text-[10px] uppercase font-pixel ${new Date(event.submissionDate) < new Date() ? 'text-text-secondary' : 'text-lava animate-pulse'}`}>
                            {new Date(event.submissionDate) < new Date() ? 'Deadline Passed' : 'Critical Deadline'}
                          </p>
                          {new Date(event.submissionDate) < new Date() && (
                            <Badge variant="stone" className="h-4 px-1 text-[8px] opacity-50">EXPIRED</Badge>
                          )}
                        </div>
                        <p className="text-sm text-white font-sans">
                          Submissions {new Date(event.submissionDate) < new Date() ? 'closed' : 'close'} on {formatFullDate(event.submissionDate)}
                        </p>
                      </div>
                      <Calendar className={new Date(event.submissionDate) < new Date() ? 'text-text-secondary' : 'text-lava'} size={24} />
                    </div>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Trophy size={18} className="text-sand" />
                    <h3 className="text-xs uppercase font-pixel tracking-[0.2em] text-white">Leaderboard</h3>
                  </div>

                  <div className="space-y-2">
                    {event.leaderboard && event.leaderboard.length > 0 ? (
                      [...event.leaderboard].sort((a, b) => a.rank - b.rank).map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-stone/20 border border-border/30 rounded-lg group hover:border-sand/30 transition-all">
                          <div className="flex items-center gap-3">
                            <span className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-pixel ${
                              entry.rank === 1 ? "bg-sand text-black" : 
                              entry.rank === 2 ? "bg-stone-400 text-black" : 
                              entry.rank === 3 ? "bg-orange-600 text-black" : "bg-stone/40 text-text-secondary"
                            }`}>
                              {entry.rank}
                            </span>
                            <div>
                              <p className="text-xs text-white font-sans font-medium">{entry.playerName}</p>
                              {entry.projectLink && (
                                <a href={entry.projectLink} target="_blank" rel="noopener noreferrer" className="text-[9px] text-sky hover:underline flex items-center gap-1 mt-0.5">
                                  <LinkIcon size={8} /> View Project
                                </a>
                              )}
                            </div>
                          </div>
                          <span className="text-xs font-pixel text-sand">{entry.score}</span>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center border-2 border-dashed border-border/20 rounded-xl bg-stone/5">
                        <p className="text-[10px] uppercase font-pixel text-text-secondary tracking-widest">Awaiting Results</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-4 border-t border-border/30">
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="uppercase font-pixel text-[10px] tracking-widest"
              >
                Close File
              </Button>
              <Button 
                variant={event.accent || "lava"} 
                className="uppercase font-pixel text-[10px] tracking-[0.2em] px-8"
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? <Loader2 className="animate-spin mr-2" size={12} /> : null}
                {syncing ? "Syncing..." : "Sync Status"}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
