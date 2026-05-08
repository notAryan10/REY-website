"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Upload, Trash2, Calendar, FileText, Check, AlertCircle, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socket";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface Event {
  _id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  accent: "grass" | "lava" | "sky" | "sand" | "stone";
  isPublic: boolean;
}

interface Resource {
  _id: string;
  title: string;
  accent?: "grass" | "lava" | "sky" | "sand" | "stone";
  type?: string;
  size?: string;
  accessLevel: string;
}

type AccentColor = "grass" | "lava" | "sky" | "sand" | "stone";

export function AdminCMS() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"events" | "resources">("events");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceLoading, setResourceLoading] = useState(false);

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    type: "event",
    date: "",
    accent: "sky" as AccentColor,
    isPublic: true,
  });

  const [resourceForm, setResourceForm] = useState({
    title: "",
    file: null as File | null,
    eventId: "",
    accessLevel: "public",
    accent: "sky" as AccentColor,
  });

  useEffect(() => {
    fetchEvents();
    fetchResources();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch {
      console.error("Failed to fetch events", err);
    }
  };

  const fetchResources = async () => {
    setResourceLoading(true);
    try {
      const res = await fetch("/api/resources");
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      }
    } catch {
      console.error("Failed to fetch resources", err);
    } finally {
      setResourceLoading(false);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventForm),
      });

      if (res.ok) {
        setStatus({ type: "success", message: "Event created successfully! ⚡" });
        setEventForm({ title: "", description: "", type: "event", date: "", accent: "sky" as AccentColor, isPublic: true });
        fetchEvents();
      } else {
        const error = await res.json();
        setStatus({ type: "error", message: error.error || "Failed to create event" });
      }
    } catch {
      setStatus({ type: "error", message: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceForm.file) return;

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("file", resourceForm.file);
    formData.append("title", resourceForm.title);
    formData.append("eventId", resourceForm.eventId);
    formData.append("accessLevel", resourceForm.accessLevel);
    formData.append("accent", resourceForm.accent);

    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setStatus({ type: "success", message: "Resource uploaded successfully! 📁" });
        
        // Trigger XP Reward
        if (session?.user?.id) {
          socket.emit("xp:add", { userId: session.user.id, action: "project_upload" });
        }
        
        setResourceForm({ title: "", file: null, eventId: "", accessLevel: "public", accent: "sky" as AccentColor });
        fetchResources(); // Refresh archive list
      } else {
        const error = await res.json();
        const errorMessage = error.error || `Upload failed with status: ${res.status}`;
        console.error("UPLOAD_ERROR:", error);
        setStatus({ type: "error", message: errorMessage });
      }
    } catch {
      console.error("FATAL_UPLOAD_ERROR:");
      setStatus({ type: "error", message: "Network error or server crash during transit" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm("Are you sure you want to purge this knowledge artifact? This is irreversible.")) return;

    try {
      const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });
      if (res.ok) {
        setStatus({ type: "success", message: "Resource identity purged. ⚡" });
        fetchResources();
      } else {
        const error = await res.json();
        setStatus({ type: "error", message: error.error || "Failed to delete" });
      }
    } catch {
      setStatus({ type: "error", message: "An unexpected error occurred during purging." });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex gap-4 p-1 bg-stone/20 border-2 border-border/50 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("events")}
          className={`px-6 py-2 rounded-md transition-all duration-300 font-pixel text-[10px] uppercase tracking-widest ${
            activeTab === "events" ? "bg-sky text-white shadow-lg shadow-sky/20" : "text-text-secondary hover:text-white"
          }`}
        >
          Manage Events
        </button>
        <button
          onClick={() => setActiveTab("resources")}
          className={`px-6 py-2 rounded-md transition-all duration-300 font-pixel text-[10px] uppercase tracking-widest ${
            activeTab === "resources" ? "bg-grass text-white shadow-lg shadow-grass/20" : "text-text-secondary hover:text-white"
          }`}
        >
          Manage Resources
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "events" ? (
            <Card accent={eventForm.accent} className="max-w-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className={`p-2 bg-${eventForm.accent}/10 rounded-lg`}>
                  <Calendar className={`text-${eventForm.accent}`} size={20} />
                </div>
                <h3 className="text-xl uppercase font-pixel tracking-tighter">Create New Event</h3>
              </div>

              <form onSubmit={handleEventSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-pixel text-text-secondary tracking-widest">Title</label>
                  <input
                    type="text"
                    required
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full bg-stone/20 border-2 border-border/50 rounded-lg px-4 py-3 text-white focus:border-sky/50 transition-all outline-none"
                    placeholder="Enter event name..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-pixel text-text-secondary tracking-widest">Description</label>
                  <textarea
                    required
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    className="w-full bg-stone/20 border-2 border-border/50 rounded-lg px-4 py-3 text-white focus:border-sky/50 transition-all outline-none h-32 resize-none"
                    placeholder="What's this event about?"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-pixel text-text-secondary tracking-widest">Type</label>
                    <select
                      value={eventForm.type}
                      onChange={(e) => {
                        const type = e.target.value;
                        setEventForm({ 
                          ...eventForm, 
                          type, 
                          isPublic: type === "workshop" ? false : eventForm.isPublic 
                        });
                      }}
                      className="w-full bg-stone/20 border-2 border-border/50 rounded-lg px-4 py-3 text-white focus:border-sky/50 transition-all outline-none appearance-none"
                    >
                      <option value="event">Standard Event</option>
                      <option value="gamejam">Game Jam</option>
                      <option value="workshop">Edu Workshop</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-pixel text-text-secondary tracking-widest">Date</label>
                    <input
                      type="datetime-local"
                      required
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className="w-full bg-stone/20 border-2 border-border/50 rounded-lg px-4 py-3 text-white focus:border-sky/50 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-pixel text-text-secondary tracking-widest">Visual Accent</label>
                    <div className="flex gap-3">
                      {["sky", "lava", "grass", "sand"].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setEventForm({ ...eventForm, accent: color as AccentColor })}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            eventForm.accent === color ? "border-white scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-100"
                          }`}
                          style={{ backgroundColor: `var(--color-${color})` }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-pixel text-text-secondary tracking-widest">Visibility</label>
                    <div className="flex items-center gap-4 py-2">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          disabled={eventForm.type === "workshop"}
                          checked={eventForm.isPublic}
                          onChange={(e) => setEventForm({ ...eventForm, isPublic: e.target.checked })}
                          className="hidden"
                        />
                        <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${
                          eventForm.isPublic ? "bg-sky" : "bg-stone/50"
                        }`}>
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${
                            eventForm.isPublic ? "right-1" : "left-1"
                          }`} />
                        </div>
                        <span className="text-xs font-sans text-text-secondary group-hover:text-white transition-colors">
                          {eventForm.isPublic ? "Public (Visible to Spectators)" : "Member-Only"}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit"
                    variant={eventForm.accent} 
                    className="w-full h-12 uppercase font-pixel tracking-[0.2em] text-xs" 
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Plus className="mr-2" size={16} />}
                    Finalize Event Setup
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <div className="space-y-8">
              <Card accent={resourceForm.accent} className="max-w-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className={`p-2 bg-${resourceForm.accent}/10 rounded-lg`}>
                    <Upload className={`text-${resourceForm.accent}`} size={20} />
                  </div>
                  <h3 className="text-xl uppercase font-pixel tracking-tighter">Upload Knowledge Artifact</h3>
                </div>

                <form onSubmit={handleResourceSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-pixel text-text-secondary tracking-widest">Resource Title</label>
                    <input
                      type="text"
                      required
                      value={resourceForm.title}
                      onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                      className="w-full bg-stone/20 border-2 border-border/50 rounded-lg px-4 py-3 text-white focus:border-grass/50 transition-all outline-none"
                      placeholder="e.g., Intro to WebGL (PDF)..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-pixel text-text-secondary tracking-widest">Select Data File</label>
                    <div className="relative h-32 border-2 border-dashed border-border/50 rounded-lg flex flex-col items-center justify-center group hover:border-grass/50 transition-all cursor-pointer overflow-hidden text-center bg-stone/10">
                      <input
                        type="file"
                        required
                        onChange={(e) => setResourceForm({ ...resourceForm, file: e.target.files?.[0] || null })}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      {resourceForm.file ? (
                        <div className="flex flex-col items-center gap-2">
                          <Check className="text-grass" size={24} />
                          <span className="text-xs text-white font-sans">{resourceForm.file.name}</span>
                          <span className="text-[10px] text-text-secondary uppercase font-pixel">Ready for Transit</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="text-text-secondary group-hover:text-grass transition-colors" size={24} />
                          <span className="text-xs text-text-secondary">Drag & Drop or Click to Upload</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-pixel text-text-secondary tracking-widest">Link to Event (Optional)</label>
                      <select
                        value={resourceForm.eventId}
                        onChange={(e) => setResourceForm({ ...resourceForm, eventId: e.target.value })}
                        className="w-full bg-stone/20 border-2 border-border/50 rounded-lg px-4 py-3 text-white focus:border-grass/50 transition-all outline-none appearance-none"
                      >
                        <option value="">Detached Resource</option>
                        {events.map((ev) => (
                          <option key={ev._id} value={ev._id}>{ev.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-pixel text-text-secondary tracking-widest">Access Protocol</label>
                      <select
                        value={resourceForm.accessLevel}
                        onChange={(e) => setResourceForm({ ...resourceForm, accessLevel: e.target.value })}
                        className="w-full bg-stone/20 border-2 border-border/50 rounded-lg px-4 py-3 text-white focus:border-grass/50 transition-all outline-none appearance-none"
                      >
                        <option value="public">Public (All Visitors)</option>
                        <option value="members">Classified (Members Only)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-pixel text-text-secondary tracking-widest">Visual Accent</label>
                    <div className="flex gap-3">
                      {["sky", "lava", "grass", "sand"].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setResourceForm({ ...resourceForm, accent: color as AccentColor })}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            resourceForm.accent === color ? "border-white scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-100"
                          }`}
                          style={{ backgroundColor: `var(--color-${color})` }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit"
                      variant="grass" 
                      className="w-full h-12 uppercase font-pixel tracking-[0.2em] text-xs" 
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <FileText className="mr-2" size={16} />}
                      Initiate Data Transfer
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Resource Archive List */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                   <div className="w-2 h-2 bg-grass rounded-full animate-pulse" />
                   <h3 className="text-sm font-pixel uppercase tracking-widest text-text-secondary">Knowledge Archive</h3>
                </div>

                {resourceLoading ? (
                  <div className="flex items-center gap-2 text-text-secondary font-pixel text-[10px]">
                    <Loader2 className="animate-spin" size={12} />
                    Syncing Archive...
                  </div>
                ) : resources.length === 0 ? (
                  <p className="text-xs text-text-secondary font-sans italic">No artifacts logged in the archive.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {resources.map((resource) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={resource._id}
                        className="flex items-center justify-between p-4 bg-stone/10 border-2 border-border/30 rounded-lg group hover:border-grass/30 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 bg-${resource.accent || 'sky'}/10 rounded-md`}>
                            <FileText size={18} className={`text-${resource.accent || 'sky'}`} />
                          </div>
                          <div>
                            <h4 className="text-white text-sm font-sans font-medium">{resource.title}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[9px] font-pixel text-text-secondary uppercase">{resource.type || 'DATA'}</span>
                              <div className="w-1 h-1 bg-stone rounded-full" />
                              <span className="text-[9px] font-pixel text-text-secondary uppercase">{resource.size || '0 MB'}</span>
                              <div className="w-1 h-1 bg-stone rounded-full" />
                              <Badge variant={resource.accessLevel === 'members' ? 'lava' : 'stone'} className="text-[8px] py-0 px-2 h-4">
                                {resource.accessLevel === 'members' ? 'CLASSIFIED' : 'PUBLIC'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteResource(resource._id)}
                          className="p-2 text-text-secondary hover:text-lava hover:bg-lava/10 rounded-lg transition-all"
                          title="Purge Identity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Status Toasts */}
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`fixed bottom-8 right-8 p-4 rounded-lg border-2 z-50 flex items-center gap-3 backdrop-blur-xl ${
              status.type === "success" ? "bg-grass/20 border-grass text-grass" : "bg-lava/20 border-lava text-lava"
            }`}
          >
            {status.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
            <span className="text-xs font-pixel uppercase tracking-widest">{status.message}</span>
            <button onClick={() => setStatus(null)} className="ml-2 hover:opacity-50">
              <Trash2 size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
