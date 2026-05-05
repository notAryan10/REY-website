"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Trophy, Plus, Trash2, Loader2, Check, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface LeaderboardEntry {
  playerName: string;
  score: number;
  rank: number;
  projectLink?: string;
}

interface EventManagementModalProps {
  event: any;
  onClose: () => void;
  onUpdate: (updatedEvent: any) => void;
}

export function EventManagementModal({ event, onClose, onUpdate }: EventManagementModalProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [formData, setFormData] = useState({
    date: event.date ? new Date(event.date).toISOString().slice(0, 16) : "",
    submissionDate: event.submissionDate ? new Date(event.submissionDate).toISOString().slice(0, 16) : "",
    leaderboard: event.leaderboard || [] as LeaderboardEntry[],
  });

  const handleAddLeaderboardEntry = () => {
    setFormData({
      ...formData,
      leaderboard: [
        ...formData.leaderboard,
        { playerName: "", score: 0, rank: formData.leaderboard.length + 1, projectLink: "" }
      ]
    });
  };

  const handleRemoveLeaderboardEntry = (index: number) => {
    const newLeaderboard = formData.leaderboard.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, leaderboard: newLeaderboard });
  };

  const handleLeaderboardChange = (index: number, field: string, value: any) => {
    const newLeaderboard = [...formData.leaderboard];
    newLeaderboard[index] = { ...newLeaderboard[index], [field]: value };
    setFormData({ ...formData, leaderboard: newLeaderboard });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(`/api/events/${event._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updated = await res.json();
        setStatus({ type: "success", message: "Event updated successfully! ⚡" });
        setTimeout(() => {
          onUpdate(updated);
          onClose();
        }, 1500);
      } else {
        const error = await res.json();
        setStatus({ type: "error", message: error.error || "Update failed" });
      }
    } catch (err) {
      setStatus({ type: "error", message: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card accent={event.accent || "lava"} className="relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-text-secondary hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 bg-${event.accent || 'lava'}/10 rounded-lg`}>
              <Calendar className={`text-${event.accent || 'lava'}`} size={20} />
            </div>
            <div>
              <h3 className="text-xl uppercase font-pixel tracking-tighter">Architect Management</h3>
              <p className="text-[10px] uppercase font-pixel text-text-secondary tracking-widest">{event.title}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-pixel text-text-secondary tracking-widest">Event Date</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-stone/20 border-2 border-border/50 rounded-lg px-4 py-3 text-white focus:border-sky/50 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-pixel text-text-secondary tracking-widest">Submission Deadline</label>
                <input
                  type="datetime-local"
                  value={formData.submissionDate}
                  onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
                  className="w-full bg-stone/20 border-2 border-border/50 rounded-lg px-4 py-3 text-white focus:border-sky/50 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-sand" />
                  <h4 className="text-xs uppercase font-pixel tracking-widest">Leaderboard</h4>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleAddLeaderboardEntry}
                  className="text-[10px] font-pixel h-8"
                >
                  <Plus size={12} className="mr-2" /> Add Player
                </Button>
              </div>

              <div className="space-y-3">
                {formData.leaderboard.map((entry: any, index: number) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-end p-4 bg-stone/10 border border-border/30 rounded-lg">
                    <div className="col-span-1 space-y-1">
                      <label className="text-[8px] uppercase font-pixel text-text-secondary">Rank</label>
                      <input
                        type="number"
                        value={entry.rank}
                        onChange={(e) => handleLeaderboardChange(index, "rank", parseInt(e.target.value))}
                        className="w-full bg-stone/20 border border-border/50 rounded px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="col-span-4 space-y-1">
                      <label className="text-[8px] uppercase font-pixel text-text-secondary">Player Name</label>
                      <input
                        type="text"
                        placeholder="Player ID"
                        value={entry.playerName}
                        onChange={(e) => handleLeaderboardChange(index, "playerName", e.target.value)}
                        className="w-full bg-stone/20 border border-border/50 rounded px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[8px] uppercase font-pixel text-text-secondary">Score</label>
                      <input
                        type="number"
                        value={entry.score}
                        onChange={(e) => handleLeaderboardChange(index, "score", parseInt(e.target.value))}
                        className="w-full bg-stone/20 border border-border/50 rounded px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="col-span-4 space-y-1">
                      <label className="text-[8px] uppercase font-pixel text-text-secondary">Project Link</label>
                      <input
                        type="text"
                        placeholder="URL"
                        value={entry.projectLink}
                        onChange={(e) => handleLeaderboardChange(index, "projectLink", e.target.value)}
                        className="w-full bg-stone/20 border border-border/50 rounded px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveLeaderboardEntry(index)}
                        className="p-2 text-text-secondary hover:text-lava transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {formData.leaderboard.length === 0 && (
                  <div className="py-8 text-center border-2 border-dashed border-border/30 rounded-lg text-text-secondary text-[10px] uppercase font-pixel">
                    No leaderboard data logged.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={onClose}
                className="flex-1 h-12 uppercase font-pixel tracking-widest text-[10px]"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant={event.accent || "lava"} 
                className="flex-[2] h-12 uppercase font-pixel tracking-[0.2em] text-[10px]" 
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin mr-2" size={14} /> : <Check className="mr-2" size={14} />}
                Update Global Parameters
              </Button>
            </div>
          </form>

          {status && (
            <div className={`mt-6 p-4 rounded-lg border-2 flex items-center gap-3 backdrop-blur-xl ${
              status.type === "success" ? "bg-grass/20 border-grass text-grass" : "bg-lava/20 border-lava text-lava"
            }`}>
              {status.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
              <span className="text-xs font-pixel uppercase tracking-widest">{status.message}</span>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
