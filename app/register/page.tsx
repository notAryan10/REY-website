"use client";

import React, { useState } from "react";
import { Lock, Mail, User, Loader2, Rocket, Shield, Zap, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function RegisterPage() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("spectator");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, accessCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setIsLoading(false);
      } else {
        router.push("/login?success=Account+created.+Please+sign+in.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  const roles = [
    { id: "spectator", title: "Spectator", icon: Eye, accent: "stone" as const, desc: "Entry level access." },
    { id: "respawner", title: "Respawner", icon: Zap, accent: "sky" as const, desc: "Member access." },
    { id: "architect", title: "Architect", icon: Shield, accent: "lava" as const, desc: "Elite rank." },
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <main className="flex-1 flex flex-col items-center justify-center p-6 pt-32 pb-24">
        <div className="w-full max-w-2xl">
          <Section title="Enlist" subtitle="rank selection mandatory" accent="sky" className="!py-0">
             <Card accent="sky" className="relative p-12 bg-card/80 backdrop-blur-md">
                <form onSubmit={handleSubmit} className="space-y-8">
                   {error && (
                     <div className="bg-lava/10 border border-lava/20 p-4 text-[10px] uppercase font-pixel tracking-tighter text-lava animate-shake">
                       {error}
                     </div>
                   )}

                   {/* ROLE SELECTION */}
                   <div className="space-y-4">
                      <label className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary">Select Your Rank</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         {roles.map((r) => (
                           <button
                             key={r.id}
                             type="button"
                             onClick={() => setRole(r.id)}
                             className={`relative p-4 border-2 transition-all duration-300 text-left group
                               ${role === r.id ? `border-${r.accent} bg-${r.accent}/5` : 'border-border/50 bg-stone/5 hover:border-border'}
                             `}
                           >
                              <div className="flex items-center justify-between mb-2">
                                 <r.icon size={20} className={role === r.id ? `text-${r.accent}` : "text-text-secondary"} />
                                 {role === r.id && <div className={`w-2 h-2 rounded-full bg-${r.accent} animate-pulse`} />}
                              </div>
                              <p className={`text-xs uppercase font-pixel tracking-wider ${role === r.id ? 'text-white' : 'text-text-secondary'}`}>{r.title}</p>
                              <p className="text-[10px] text-text-secondary pt-1 leading-tight">{r.desc}</p>
                           </button>
                         ))}
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary">Architect Name</label>
                         <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                            <input 
                              type="text" 
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                              placeholder="Steve" 
                              className="w-full bg-stone/20 border-2 border-border p-3 pl-10 text-xs text-white focus:border-sky outline-none placeholder:text-stone/40"
                            />
                         </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary">Email Address</label>
                         <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                            <input 
                              type="email" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              placeholder="architect@rey.net" 
                              className="w-full bg-stone/20 border-2 border-border p-3 pl-10 text-xs text-white focus:border-sky outline-none placeholder:text-stone/40"
                            />
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary">Secret Password</label>
                         <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                            <input 
                              type="password" 
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              placeholder="••••••••" 
                              className="w-full bg-stone/20 border-2 border-border p-3 pl-10 text-xs text-white focus:border-sky outline-none placeholder:text-stone/40"
                            />
                         </div>
                      </div>

                      {role !== "spectator" && (
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase font-pixel tracking-widest text-lava animate-pulse flex items-center gap-2">
                              Access Code Required
                           </label>
                           <div className="relative">
                              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lava/60" />
                              <input 
                                type="text" 
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                                required
                                placeholder="XXX-XXXX-XXXX" 
                                className="w-full bg-lava/5 border-2 border-lava/30 p-3 pl-10 text-xs text-white focus:border-lava outline-none placeholder:text-lava/20"
                              />
                           </div>
                        </div>
                      )}
                   </div>

                   <div className="flex items-center justify-between">
                      <Link href="/login" className="text-[10px] uppercase font-pixel tracking-widest text-stone hover:text-white transition-colors underline">Already identified?</Link>
                   </div>

                   <Button variant={role === "architect" ? "lava" : role === "respawner" ? "sky" : "secondary"} type="submit" disabled={isLoading} className="w-full py-6 text-xl transition-all duration-300">
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" /> Finalizing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Enlist as {role} <Rocket size={18} />
                        </div>
                      )}
                   </Button>
                </form>

                <div className="mt-8 pt-8 border-t border-border/50 text-center space-y-4">
                   <p className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary leading-loose">
                     By enlisting as an <span className="text-white uppercase">{role}</span>, you agree to our <br />
                     <span className="text-white">Collective Governance Charter</span>.
                   </p>
                </div>
             </Card>
          </Section>
        </div>
      </main>
    </div>
  );
}
