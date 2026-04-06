"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Zap, Trophy, Users, Shield, Rocket, ExternalLink, Box, Calendar, FileText, ChevronRight } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

import { ScrollReveal } from "@/components/layout/ScrollReveal";
import FallingText from "@/components/ui/FallingText";

export default function Home() {
  const [latestEvent, setLatestEvent] = React.useState<any>(null);
  const [latestProject, setLatestProject] = React.useState<any>(null);
  const [latestResource, setLatestResource] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  React.useEffect(() => {
    const fetchFrontier = async () => {
      try {
        const [eventsRes, projectsRes, resourcesRes] = await Promise.all([
          fetch("/api/events"),
          fetch("/api/projects"),
          fetch("/api/resources")
        ]);

        if (eventsRes.ok) {
          const events = await eventsRes.json();
          setLatestEvent(events[0]);
        }
        if (projectsRes.ok) {
          const projects = await projectsRes.json();
          setLatestProject(projects[0]);
        }
        if (resourcesRes.ok) {
          const resources = await resourcesRes.json();
          setLatestResource(resources[0]);
        }
      } catch (err) {
        console.error("Failed to fetch frontier data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFrontier();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* SECTION 1 — HERO */}
        <Section className="min-h-screen pt-32 md:pt-48 pb-20 relative overflow-hidden flex items-center">
          <motion.div 
            style={{ y: y1, opacity }}
            className="absolute inset-0 z-0"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background z-10" />
            <Image 
              src="/hero.png" 
              alt="REY Hero" 
              fill 
              priority
              className="object-cover opacity-40 scale-110"
              quality={90}
            />
          </motion.div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-[600px] opacity-10 pointer-events-none z-0">
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-[500px] h-[500px] bg-grass/20 blur-[120px] rounded-full animate-pulse" />
            </div>
          </div>

          <ScrollReveal direction="up">
            <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto relative z-10">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
                <h1 className="text-6xl md:text-9xl !leading-[0.8] text-white mb-4 uppercase tracking-tighter font-pixel drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">R.E.Y</h1>
                <p className="text-grass font-pixel text-[10px] md:text-xs uppercase tracking-[0.3em] mb-8">Explore • Create • Level Up</p>
                <p className="text-text-secondary text-lg md:text-xl max-w-xl mx-auto leading-relaxed font-sans">The ultimate destination for digital architects and competitive pioneers.</p>
              </motion.div>
              <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
                <Link href="/gamejams">
                  <Button variant="grass" size="lg" className="px-10">Explore Jams <ExternalLink className="ml-2 w-4 h-4" /></Button>
                </Link>
                <Link href="/register">
                  <Button variant="secondary" size="lg" className="px-10">Join Club</Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </Section>

        <Section className="py-20 bg-background/50 border-y border-border/20">
          <Container>
            <FallingText
              text="R.E.Y — Respawn Every Year — is a community of digital architects, builders, and pioneers crafting the future of virtual worlds. Explore our creations, join our game jams, and level up your skills with us."
              highlightWords={["R.E.Y", "architects", "builders", "pioneers", "future", "virtual", "worlds", "skills"]}
              highlightClass="highlighted"
              trigger="scroll"
              backgroundColor="transparent"
              wireframes={false}
              gravity={0.56}
              fontSize="2rem"
              mouseConstraintStiffness={0.9}
            />
          </Container>
        </Section>

        {/* SECTION 2 — FEATURE CARDS */}
        <ScrollReveal direction="up" delay={0.2}>
          <Section title="The Frontier" subtitle="latest updates" accent="sky">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {loading ? (
                [...Array(3)].map((_, i) => <Card key={i} className="h-40 animate-pulse bg-stone/10 border-border/50"><div /></Card>)
              ) : (
                <>
                  {/* LATEST EVENT */}
                  <Card accent={latestEvent?.accent || "lava"}>
                    <div className="space-y-4">
                        <Badge variant={latestEvent?.accent || "lava"} icon={<Calendar size={10} />}>{latestEvent ? "Upcoming Event" : "Standby"}</Badge>
                        <h3 className="text-xl uppercase truncate">{latestEvent?.title || "No Events Scheduled"}</h3>
                        <p className="text-text-secondary text-sm font-sans line-clamp-2">
                          {latestEvent ? `Join us on ${latestEvent.date} at ${latestEvent.location}.` : "Stay tuned for the next community gathering."}
                        </p>
                        <Link href="/events">
                          <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent text-text-secondary hover:text-white transition-colors">See All Events →</Button>
                        </Link>
                    </div>
                  </Card>

                  {/* LATEST PROJECT */}
                  <Card accent={latestProject?.accent || "grass"} className="group/card relative overflow-hidden">
                    <div className="space-y-4">
                        <Badge variant={latestProject?.accent || "grass"} icon={<Box size={10} />}>{latestProject?.tag || "Latest Build"}</Badge>
                        <h3 className="text-xl uppercase truncate text-white">{latestProject?.title || "Project Alpha"}</h3>
                        <p className="text-text-secondary text-sm font-sans line-clamp-2 leading-relaxed">
                          {latestProject?.description || "Building the future of the R.E.Y community, one block at a time."}
                        </p>
                        <Link href="/projects">
                          <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent text-text-secondary hover:text-white transition-colors">
                            Explore Assets <ChevronRight size={14} className="ml-1 inline-block group-hover/card:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                    </div>
                  </Card>

                  {/* LATEST RESOURCE */}
                  <Card accent={latestResource?.accent || "sky"}>
                    <div className="space-y-4">
                        <Badge variant={latestResource?.accent || "sky"} icon={<Zap size={10} />}>News & Assets</Badge>
                        <h3 className="text-xl uppercase truncate">{latestResource?.title || "Community Pack"}</h3>
                        <p className="text-text-secondary text-sm font-sans line-clamp-2">
                          {latestResource ? `${latestResource.type} Asset • ${latestResource.size}` : "Download the latest textures and schematics for your world."}
                        </p>
                        <Link href="/resources">
                          <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent text-text-secondary hover:text-white transition-colors">Asset Gallery →</Button>
                        </Link>
                    </div>
                  </Card>
                </>
              )}
            </div>
          </Section>
        </ScrollReveal>

        {/* SECTION 3 — ROLE SYSTEM PREVIEW */}
        <ScrollReveal direction="up">
          <Section title="Ranking System" subtitle="your path forward" accent="sand">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Spectator", variant: "stone" as const, desc: "The entry point. Watch events, explore public builds, and learn the R.E.Y way.", capabilities: ["Watch live events", "Public world access", "Community chat"] },
                { name: "Respawner", variant: "sky" as const, desc: "Active members who participate in events and contribute to small-scale projects.", capabilities: ["Event participation", "Member resources", "Build rights"] },
                { name: "Core Architect", variant: "lava" as const, desc: "The elite. Leading megaprojects and mentoring the next generation of builders.", capabilities: ["Lead megaprojects", "Governance voting", "Exclusive rewards"] }
              ].map((role, i) => (
                <Card key={i} accent={role.variant} className="flex flex-col h-full bg-card/50">
                  <div className="space-y-6 flex-grow">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl uppercase">{role.name}</h3>
                      <Badge variant={role.variant}>{role.name === 'Core Architect' ? "ELITE" : "MEMBER"}</Badge>
                    </div>
                    <p className="text-text-secondary text-sm font-sans">{role.desc}</p>
                    <div className="space-y-2 pt-4">
                      <p className="text-[10px] uppercase text-text-secondary font-pixel tracking-widest">// Capabilities</p>
                      <ul className="space-y-2">
                        {role.capabilities.map((cap, j) => (
                          <li key={j} className="flex items-center gap-2 text-xs text-white">
                            <div className={`w-1 h-1 rounded-full bg-${role.variant}`} />
                            {cap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Section>
        </ScrollReveal>

        {/* SECTION 4 — CTA */}
        <ScrollReveal direction="up">
          <Section accent="grass" className="relative">
            <Card accent="grass" className="bg-grass/5 border-none p-12 md:p-24 text-center overflow-visible">
              <div className="max-w-2xl mx-auto space-y-8 relative z-10">
                  <h2 className="text-4xl md:text-6xl uppercase leading-tight font-pixel">Join <span className="text-grass">R.E.Y</span></h2>
                  <p className="text-text-secondary text-lg font-sans">Become a part of the most ambitious digital collective. Start your journey from Spectator to Core Architect today.</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link href="/register">
                      <Button variant="grass" size="lg" className="w-full sm:w-auto px-16">Join The Club</Button>
                    </Link>
                  </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-grass/10 blur-3xl rounded-full -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-grass/10 blur-3xl rounded-full -ml-32 -mb-32" />
            </Card>
          </Section>
        </ScrollReveal>
      </main>

      <footer className="py-12 border-t-2 border-border/30 bg-background text-center">
        <Container>
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-2 group opacity-50 hover:opacity-100 transition-opacity uppercase font-pixel tracking-tighter">
              <Rocket className="w-6 h-6 text-grass" />
              <span className="text-lg text-white">R.E.Y</span>
            </div>
            <p className="text-text-secondary text-[10px] uppercase tracking-widest leading-loose font-pixel">
              &copy; 2026 R.E.Y CLUB.<br />
              BUILT FOR ARCHITECTS.
            </p>
            <div className="flex gap-8">
              {['Discord', 'Twitter', 'YouTube'].map(social => (
                <a key={social} href="#" className="font-pixel text-[8px] uppercase text-text-secondary hover:text-white transition-colors">{social}</a>
              ))}
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
