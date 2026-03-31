"use client";

import React from "react";
import { motion } from "framer-motion";
import { Rocket, Shield, Eye, Flame, Cloud, Zap, CheckCircle, Smartphone, Globe } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Section } from "@/components/layout/Section";
import { Navbar } from "@/components/layout/Navbar";

export default function UIPreviewPage() {
  return (
    <main className="min-h-screen pt-24 pb-20 overflow-x-hidden">
      <Navbar />

      <Section title="RE.Y DESIGN SYSTEM"  subtitle="visual identity preview" accent="grass" >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl leading-tight">
              BUILDING <span className="text-grass">DIGITAL</span> WORLDS.
            </h1>
            <p className="text-text-secondary text-lg max-w-xl">
              A consistent, game-inspired UI system designed for the REY community. 
              Dark mode by default, vibrant highlights, and smooth animations.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="grass">Get Started</Button>
              <Button variant="secondary">Read More</Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Card accent="grass" className="flex flex-col items-center justify-center py-8 text-center">
              <Cloud className="w-10 h-10 text-grass mb-4" />
              <h3 className="text-sm">Sky Build</h3>
            </Card>
            <Card accent="lava" className="flex flex-col items-center justify-center py-8 text-center">
              <Flame className="w-10 h-10 text-lava mb-4" />
              <h3 className="text-sm">Nether Tech</h3>
            </Card>
            <Card accent="sky" className="flex flex-col items-center justify-center py-8 text-center">
              <Shield className="w-10 h-10 text-sky mb-4" />
              <h3 className="text-sm">Guardian</h3>
            </Card>
            <Card accent="sand" className="flex flex-col items-center justify-center py-8 text-center">
              <Zap className="w-10 h-10 text-sand mb-4" />
              <h3 className="text-sm">Desert Flux</h3>
            </Card>
          </div>
        </div>
      </Section>

      <Section title="Buttons" subtitle="interactive elements" accent="sky">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="flex flex-col gap-4">
            <h4 className="text-[10px] text-text-secondary uppercase">// Primary Variants</h4>
            <div className="flex flex-col gap-3">
              <Button variant="primary">Primary Default</Button>
              <Button variant="secondary">Secondary Outline</Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>
          </Card>
          
          <Card className="flex flex-col gap-4">
            <h4 className="text-[10px] text-text-secondary uppercase">// Accent Variants</h4>
            <div className="flex flex-col gap-3">
              <Button variant="grass">Grass Green</Button>
              <Button variant="lava">Lava Orange</Button>
              <Button variant="sky">Sky Blue</Button>
              <Button variant="sand">Sand Yellow</Button>
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <h4 className="text-[10px] text-text-secondary uppercase">// Sizes</h4>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="grass" size="sm">Small</Button>
              <Button variant="grass" size="md">Medium</Button>
              <Button variant="grass" size="lg">Large</Button>
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <h4 className="text-[10px] text-text-secondary uppercase">// Animation States</h4>
            <div className="flex flex-col gap-3">
              <p className="text-[10px] text-text-secondary italic">Hover for 1.05x scale, Click for 0.95x</p>
              <Button variant="primary" disabled>Disabled State</Button>
            </div>
          </Card>
        </div>
      </Section>

      <Section title="Badges" subtitle="roles and labels" accent="lava">
        <div className="flex flex-wrap gap-4 items-center">
          <Badge variant="lava" icon={<Flame size={12} />}>Architect</Badge>
          <Badge variant="grass" icon={<CheckCircle size={12} />}>Respawner</Badge>
          <Badge variant="sky" icon={<Eye size={12} />}>Spectator</Badge>
          <Badge variant="sand" icon={<Zap size={12} />}>Admin</Badge>
          <Badge variant="stone" icon={<Shield size={12} />}>Member</Badge>
        </div>
      </Section>

      <Section title="Cards" subtitle="content containers" accent="sand">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card accent="grass">
            <div className="space-y-4">
              <Badge variant="grass">New Event</Badge>
              <h3 className="text-xl">Skywars Season 4</h3>
              <p className="text-text-secondary text-sm">
                Compete in the ultimate sky battle and win exclusive ranks and rewards.
              </p>
              <Button variant="secondary" size="sm">Details</Button>
            </div>
          </Card>
          
          <Card accent="lava">
            <div className="space-y-4">
              <Badge variant="lava">Emergency</Badge>
              <h3 className="text-xl">Nether Maintenance</h3>
              <p className="text-text-secondary text-sm">
                Scheduled downtime for the nether hub optimizations. Please stay tunned.
              </p>
              <Button variant="lava" size="sm">Network Status</Button>
            </div>
          </Card>

          <Card accent="sky">
            <div className="space-y-4">
              <Badge variant="sky">Community</Badge>
              <h3 className="text-xl">Resource Packs</h3>
              <p className="text-text-secondary text-sm">
                Download the official REY resource pack for the best visual experience.
              </p>
              <Button variant="sky" size="sm">Download</Button>
            </div>
          </Card>
        </div>
      </Section>

      <Section title="Typography" subtitle="font system" accent="stone">
        <div className="space-y-8">
          <div className="border-l-4 border-grass pl-6 space-y-2">
            <h1 className="text-5xl uppercase">Heading 1</h1>
            <p className="text-text-secondary uppercase text-[10px]">// 48px Press Start 2P</p>
          </div>
          <div className="border-l-4 border-lava pl-6 space-y-2">
            <h2 className="text-3xl uppercase">Heading 2</h2>
            <p className="text-text-secondary uppercase text-[10px]">// 30px Press Start 2P</p>
          </div>
          <div className="border-l-4 border-sky pl-6 space-y-2">
            <h3 className="text-xl uppercase">Heading 3</h3>
            <p className="text-text-secondary uppercase text-[10px]">// 20px Press Start 2P</p>
          </div>
          <div className="border-l-4 border-sand pl-6 space-y-4 max-w-2xl">
            <p className="text-lg text-white font-sans">
              Body Text Large - Inter Sans Serif. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Vivamus lacinia odio vitae vestibulum vestibulum. 
            </p>
            <p className="text-base text-text-secondary font-sans">
              Body Text Regular - Inter Sans Serif. Cras dapibus vivamus elementum semper nisi. 
              Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim.
            </p>
            <p className="text-text-secondary uppercase text-[10px]">// 16px Inter Regular</p>
          </div>
        </div>
      </Section>
    </main>
  );
}
