"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Download, Lock, FileText, Globe, Shield } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { motion } from "framer-motion";

export default function ResourcesPage() {
  const { data: session, status } = useSession();
  const [resources, setResources] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch("/api/resources");
        if (res.ok) {
          const data = await res.json();
          setResources(data);
        }
      } catch (err) {
        console.error("Failed to fetch resources:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const userRole = session?.user?.role || "spectator";
  
  // Members are Respawner and Architect
  const isMember = status === "authenticated" && (userRole === "respawner" || userRole === "architect");

  const publicResources = resources.filter(r => r.accessLevel === "public");
  const memberResources = resources.filter(r => r.accessLevel === "members");

  const handleDownload = (res: any) => {
    if (res._id) {
       // Direct to secure download API instead of Cloudinary URL
       window.open(`/api/download/${res._id}`, "_blank");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pt-24 pb-20">
        <Section title="Data Vault" subtitle="knowledge & assets" accent="sand">
           <div className="space-y-16 pt-8">
              {/* Public Section */}
              <ScrollReveal direction="up">
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-pixel uppercase tracking-widest text-text-secondary bg-zinc-800/20 px-4 py-2 border-l-4 border-sky">Public Archives</h3>
                    <Badge variant="sky" icon={<Globe size={12} />}>Open Access</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                       [...Array(3)].map((_, i) => (
                         <Card key={i} className="h-32 animate-pulse bg-stone/10 border-border/50">
                           <div />
                         </Card>
                       ))
                    ) : publicResources.length > 0 ? (
                      publicResources.map((res, i) => (
                        <Card key={i} accent={res.accent as any || "sky"} className="group transition-all duration-300 hover:bg-stone/10">
                           <div className="flex flex-col h-full space-y-4">
                              <div className="flex items-center gap-4">
                                 <div className={`p-3 bg-${res.accent || "sky"}/10 border border-${res.accent || "sky"}/20 rounded`}>
                                    <FileText className={`w-6 h-6 text-${res.accent || "sky"}`} />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <h4 className="text-lg uppercase group-hover:text-white transition-colors truncate leading-tight">{res.title}</h4>
                                    <p className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary">{res.size} • {res.type}</p>
                                 </div>
                              </div>
                              <Button 
                                variant={(res.accent as any) || "sky"} 
                                size="sm" 
                                className="w-full h-10 uppercase font-pixel text-[10px] tracking-widest"
                                onClick={() => handleDownload(res)}
                              >
                                 <Download size={14} className="mr-2" /> Retrieve File
                              </Button>
                           </div>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full p-12 text-center border-2 border-dashed border-border/50 text-text-secondary font-pixel text-[10px] uppercase tracking-widest bg-stone/5">
                         Empty Archive
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>

              {/* Members Section */}
              <ScrollReveal direction="up" delay={0.2}>
                <div className="space-y-8">
                   <div className="flex items-center gap-4">
                     <h3 className="text-xl font-pixel uppercase tracking-widest text-text-secondary bg-zinc-800/20 px-4 py-2 border-l-4 border-lava flex-grow">Classified Intel</h3>
                     <Badge variant="lava" icon={<Shield size={12} />}>Members Only</Badge>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                       [...Array(3)].map((_, i) => (
                         <Card key={i} className="h-40 animate-pulse bg-stone/10 border-border/50">
                           <div />
                         </Card>
                       ))
                    ) : memberResources.length > 0 ? (
                      memberResources.map((res, i) => {
                        const isLocked = !isMember;
                        return (
                          <Card key={i} accent={(res.accent as any) || "lava"} className="group hover:bg-stone/10 transition-all duration-300 relative overflow-hidden">
                             {/* Locked UI Overlay */}
                             {isLocked && (
                               <motion.div 
                                 initial={{ opacity: 0 }}
                                 animate={{ opacity: status === "authenticated" ? 0.8 : 1 }}
                                 whileHover={{ opacity: 1 }}
                                 className="absolute inset-0 bg-background/60 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center space-y-4 transition-all duration-500"
                               >
                                  <motion.div
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    <Lock className="w-8 h-8 text-lava" />
                                  </motion.div>
                                  <div className="space-y-1">
                                    <p className="text-white text-[10px] uppercase font-pixel tracking-widest">Restricted Asset</p>
                                    <p className="text-text-secondary text-[8px] uppercase font-pixel">Join to unlock</p>
                                  </div>
                                  {status === "unauthenticated" ? (
                                    <Link href="/register">
                                      <Button variant="lava" size="sm" className="px-6 h-8 text-[8px] uppercase font-pixel">Join Club</Button>
                                    </Link>
                                  ) : (
                                    <Badge variant="lava" className="text-[8px] py-1">Access Denied</Badge>
                                  )}
                               </motion.div>
                             )}

                             <div className="flex flex-col h-full space-y-6">
                                <div className="flex items-center gap-4">
                                   <div className={`p-3 bg-${res.accent || "lava"}/10 border border-${res.accent || "lava"}/20 rounded`}>
                                      <Shield className={`w-6 h-6 text-${res.accent || "lava"}`} />
                                   </div>
                                   <div className="flex-1 min-w-0">
                                      <h4 className="text-lg uppercase truncate group-hover:text-white transition-colors leading-tight">{res.title}</h4>
                                      <p className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary">{res.size} • {res.type}</p>
                                   </div>
                                </div>
                                <div className="pt-4 border-t border-border/50">
                                   <Button 
                                     variant={isLocked ? "ghost" : ((res.accent as any) || "lava")} 
                                     disabled={isLocked} 
                                     className="w-full h-10 text-[10px] uppercase font-pixel tracking-widest"
                                     onClick={() => handleDownload(res)}
                                   >
                                      {isLocked ? "Scan Required" : "Retrive Artifact"}
                                   </Button>
                                </div>
                             </div>
                          </Card>
                        );
                      })
                    ) : (
                      <div className="col-span-full p-12 text-center border-2 border-dashed border-border/50 text-text-secondary font-pixel text-[10px] uppercase tracking-widest bg-stone/5">
                         No Classified Intel found
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
