"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Gamepad2, ExternalLink, PlusCircle, User, Loader2, Rocket, Beaker } from "lucide-react";
import { socket } from "@/lib/socket";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectCard } from "@/components/projects/ProjectCard";

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);

  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    itchIoUrl: "",
    accent: "sky" as "lava" | "sky" | "grass",
    tag: "Community Project"
  });

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    fetchProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({
          title: "",
          description: "",
          itchIoUrl: "",
          accent: "sky",
          tag: "Community Project"
        });
        setShowForm(false);
        fetchProjects();
        
        if (session?.user?.id) {
           socket.emit("xp:add", { userId: (session.user as any).id, action: "project_upload" });
        }
      } else {
        const error = await res.json();
        alert(error.error || "Failed to submit project");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pt-24 pb-20">
        <Section title="The Workshop" subtitle="community projects" accent="grass">
          <div className="space-y-16 pt-8">
            <ScrollReveal direction="up">
              <div className="max-w-4xl mx-auto">
                <Card accent="grass" className="bg-grass/5 border-grass/20 p-8 md:p-12 text-center overflow-visible relative">
                  <div className="space-y-6 relative z-10">
                    <h2 className="text-3xl md:text-5xl uppercase leading-tight font-pixel">Share Your <span className="text-grass underline underline-offset-8">Build</span></h2>
                    <p className="text-text-secondary text-sm md:text-md font-sans max-w-xl mx-auto">
                      Constructed something legendary? Link your Itch.io project here and let the R.E.Y collective experience your blueprint.
                    </p>
                    
                    {status === "unauthenticated" ? (
                      <div className="pt-4">
                        <Link href="/login">
                          <Button variant="grass" size="lg">Login to Submit</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="pt-4">
                        <Button 
                          variant={showForm ? "secondary" : "grass"} 
                          size="lg" 
                          onClick={() => setShowForm(!showForm)}
                          className="px-10"
                        >
                          {showForm ? "Cancel Mission" : "Submit New Project"}
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>

                <AnimatePresence>
                  {showForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -20 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -20 }}
                      className="overflow-hidden mt-8"
                    >
                      <Card accent="sky" className="bg-zinc-900 border-sky/30">
                        <form onSubmit={handleSubmit} className="space-y-6 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-pixel text-text-secondary">Project Name</label>
                              <input 
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                placeholder="e.g., Solar Citadel"
                                className="w-full bg-background border-2 border-border p-4 font-sans text-white focus:border-grass outline-none transition-colors"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-pixel text-text-secondary">Itch.io Link</label>
                              <input 
                                required
                                type="url"
                                value={formData.itchIoUrl}
                                onChange={(e) => setFormData({...formData, itchIoUrl: e.target.value})}
                                placeholder="https://username.itch.io/project"
                                className="w-full bg-background border-2 border-border p-4 font-sans text-white focus:border-sky outline-none transition-colors"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-pixel text-text-secondary">Description</label>
                            <textarea 
                              required
                              value={formData.description}
                              onChange={(e) => setFormData({...formData, description: e.target.value})}
                              placeholder="Briefly describe your vision..."
                              rows={3}
                              className="w-full bg-background border-2 border-border p-4 font-sans text-white focus:border-sand outline-none transition-colors resize-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-pixel text-text-secondary">Visual Accent</label>
                              <div className="flex gap-4">
                                {["sky", "lava", "grass"].map((a) => (
                                  <button key={a} type="button" onClick={() => setFormData({...formData, accent: a as any})} className={`flex-1 py-3 px-2 border-2 uppercase font-pixel text-[8px] transition-all ${formData.accent === a ? `border-${a} bg-${a}/20 text-white`  : "border-border text-text-secondary hover:border-zinc-700" }`}>
                                    {a}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-end">
                              <Button type="submit"  variant={formData.accent}  disabled={isSubmitting} className="w-full h-[52px] uppercase font-pixel text-[10px]">
                                {isSubmitting ? (
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                  <Rocket className="w-4 h-4 mr-2" />
                                )}
                                Upload Data Package
                              </Button>
                            </div>
                          </div>
                        </form>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2}>
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-pixel uppercase tracking-widest text-text-secondary bg-zinc-800/20 px-4 py-2 border-l-4 border-sand">Project Archives</h3>
                  <Badge variant="sand" icon={<Beaker size={12} />}>Latest Builds</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {loading ? (
                    [...Array(6)].map((_, i) => (
                      <Card key={i} className="h-64 animate-pulse bg-stone/10 border-border/50">
                        <div />
                      </Card>
                    ))
                  ) : projects.length > 0 ? (
                    projects.map((project) => (
                      <ProjectCard key={project._id} project={project} />
                    ))
                  ) : (
                    <div className="col-span-full p-20 text-center border-2 border-dashed border-border/50 text-text-secondary font-pixel text-[10px] uppercase tracking-widest bg-stone/5">
                      No Data Detected in Sector
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </Section>
      </main>
    </div>
  );
}
