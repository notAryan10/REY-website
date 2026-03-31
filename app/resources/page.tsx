"use client";

import React from "react";
import { Download, Lock, FileText, Smartphone, Globe, Shield } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { motion } from "framer-motion";

export default function ResourcesPage() {
  const publicResources = [
    { title: "V1 Texture Pack", size: "2.4 MB", type: "ZIP", accent: "grass" as const },
    { title: "Public Server IP List", size: "12 KB", type: "PDF", accent: "stone" as const },
  ];

  const memberResources = [
    { title: "Advanced Redstone Schematics", size: "4.8 MB", type: "WORLD", accent: "sky" as const },
    { title: "Exclusive Architect Rank Badge", size: "150 KB", type: "PNG", accent: "lava" as const },
    { title: "Server Side Plugins API", size: "1.2 MB", type: "JAR", accent: "sand" as const },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pt-24 pb-20">
        <Section title="Asset Gallery" subtitle="public & member resources" accent="sand">
           <div className="space-y-16 pt-8">
             <ScrollReveal direction="up">
               <div className="space-y-8">
                 <h3 className="text-xl font-pixel uppercase tracking-widest text-text-secondary bg-zinc-800/20 px-4 py-2 border-l-4 border-grass">Public Assets</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {publicResources.map((res, i) => (
                     <Card key={i} accent={res.accent} className="group transition-all duration-300">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className={`p-3 bg-${res.accent}/10 border border-${res.accent}/20`}>
                                 <FileText className={`w-8 h-8 text-${res.accent}`} />
                              </div>
                              <div>
                                 <h4 className="text-lg uppercase group-hover:text-white transition-colors">{res.title}</h4>
                                 <p className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary">{res.size} • {res.type}</p>
                              </div>
                           </div>
                           <Button variant={res.accent} size="sm">
                              <Download size={14} />
                           </Button>
                        </div>
                     </Card>
                   ))}
                 </div>
               </div>
             </ScrollReveal>

             <ScrollReveal direction="up" delay={0.2}>
               <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-pixel uppercase tracking-widest text-text-secondary bg-zinc-800/20 px-4 py-2 border-l-4 border-lava flex-grow">Member Premium Assets</h3>
                    <Badge variant="lava" icon={<Shield size={12} />}>Premium Access</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {memberResources.map((res, i) => (
                     <Card key={i} accent={res.accent} className="group hover:bg-stone/10 transition-all duration-300 relative overflow-hidden">
                        <motion.div 
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          className="absolute inset-0 bg-background/50 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center space-y-4 opacity-0 md:opacity-100 transition-opacity duration-300"
                        >
                           <Lock className="w-8 h-8 text-lava animate-pulse" />
                           <p className="text-white text-xs uppercase font-pixel tracking-widest leading-loose">
                             Access restricted to Respawner Rank & Above
                           </p>
                        </motion.div>

                        <div className="flex flex-col h-full space-y-6">
                           <div className="flex items-center gap-4">
                              <div className={`p-3 bg-${res.accent}/10 border border-${res.accent}/20`}>
                                 <Shield className={`w-8 h-8 text-${res.accent}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h4 className="text-lg uppercase truncate group-hover:text-white transition-colors">{res.title}</h4>
                                 <p className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary">{res.size} • {res.type}</p>
                              </div>
                           </div>
                           <div className="pt-4 border-t border-border/50">
                              <Button variant="ghost" disabled className="w-full text-text-secondary text-[10px] uppercase font-pixel tracking-widest">
                                 Login to Download
                              </Button>
                           </div>
                        </div>
                     </Card>
                   ))}
                  </div>
               </div>
             </ScrollReveal>
           </div>
        </Section>
      </main>
    </div>
  );
}
