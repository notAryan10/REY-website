"use client";

import React from "react";
import { 
  Terminal, 
  CheckCircle, 
  Flame, 
  Eye, 
  Zap 
} from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function UIPreviewPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="pt-32 pb-12 border-b border-white/5">
        <Section title="Design System" subtitle="visual standards" accent="grass">
          <p className="text-text-secondary max-w-2xl">
            A premium, high-contrast UI kit inspired by retro game terminals and futuristic interfaces. 
            Built for the REY developer community.
          </p>
        </Section>
      </header>

      <main className="flex-1 pb-32">
        <Section title="Color Palette" subtitle="thematic tones" accent="lava">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <ColorSwatch name="Grass" hex="#4ADE80" color="grass" />
            <ColorSwatch name="Lava" hex="#F87171" color="lava" />
            <ColorSwatch name="Sky" hex="#60A5FA" color="sky" />
            <ColorSwatch name="Sand" hex="#FACC15" color="sand" />
            <ColorSwatch name="Stone" hex="#2D2D2D" color="stone" />
          </div>
        </Section>

        <Section title="Cards & Containers" subtitle="structural units" accent="sand">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card accent="grass">
              <div className="flex items-center gap-3 mb-4">
                <Terminal className="text-grass" size={20} />
                <h3 className="text-xl uppercase font-pixel tracking-tighter">Terminal Card</h3>
              </div>
              <p className="text-sm text-text-secondary">
                Standard container with pixel-style scanlines and dynamic border accents.
              </p>
            </Card>
            
            <Card accent="lava" hoverEffect={false}>
              <div className="flex items-center gap-3 mb-4">
                <Flame className="text-lava" size={20} />
                <h3 className="text-xl uppercase font-pixel tracking-tighter">Static Container</h3>
              </div>
              <p className="text-sm text-text-secondary">
                Variant without hover interactions for complex layouts.
              </p>
            </Card>
          </div>
        </Section>

        <Section title="Buttons" subtitle="interactive elements" accent="sky">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="flex flex-col gap-4">
              <h4 className="text-[10px] text-text-secondary uppercase">{"// "} Primary Variants</h4>
              <div className="flex flex-col gap-3">
                <Button variant="primary">Primary Default</Button>
                <Button variant="secondary">Secondary Outline</Button>
                <Button variant="ghost">Ghost Button</Button>
              </div>
            </Card>
            
            <Card className="flex flex-col gap-4">
              <h4 className="text-[10px] text-text-secondary uppercase">{"// "} Accent Variants</h4>
              <div className="flex flex-col gap-3">
                <Button variant="grass">Grass Green</Button>
                <Button variant="lava">Lava Orange</Button>
                <Button variant="sky">Sky Blue</Button>
                <Button variant="sand">Sand Yellow</Button>
              </div>
            </Card>

            <Card className="flex flex-col gap-4">
              <h4 className="text-[10px] text-text-secondary uppercase">{"// "} Sizes</h4>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="grass" size="sm">Small</Button>
                <Button variant="grass" size="md">Medium</Button>
                <Button variant="grass" size="lg">Large</Button>
              </div>
            </Card>

            <Card className="flex flex-col gap-4">
              <h4 className="text-[10px] text-text-secondary uppercase">{"// "} Animation States</h4>
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
            <Badge variant="stone">Beta Participant</Badge>
          </div>
        </Section>

        <Section title="Typography" subtitle="font standards" accent="grass">
          <div className="space-y-12">
            <div className="space-y-4">
              <p className="text-text-secondary uppercase text-[10px]">{"// "} 48px Press Start 2P</p>
              <h1 className="text-4xl md:text-5xl uppercase font-pixel leading-tight">Heading Alpha</h1>
            </div>

            <div className="space-y-4">
              <p className="text-text-secondary uppercase text-[10px]">{"// "} 30px Press Start 2P</p>
              <h2 className="text-2xl md:text-3xl uppercase font-pixel">Heading Beta</h2>
            </div>

            <div className="space-y-4">
              <p className="text-text-secondary uppercase text-[10px]">{"// "} 20px Press Start 2P</p>
              <h3 className="text-xl uppercase font-pixel">Heading Gamma</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
              <div className="space-y-4">
                <p className="text-text-secondary uppercase text-[10px]">{"// "} Base Inter Text</p>
                <p className="text-base text-text-secondary leading-relaxed">
                  The primary typeface for readability and detailed information. Designed for 
                  extended reading sessions in documentation and project descriptions.
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-text-secondary uppercase text-[10px]">{"// "} 16px Inter Regular</p>
                <p className="text-sm font-sans text-text-primary tracking-wide leading-relaxed">
                  SYSTEM_CORE: ONLINE<br />
                  LATENCY: 24ms<br />
                  ENCRYPTION: AES-256<br />
                  STATUS: SECURE
                </p>
              </div>
            </div>
          </div>
        </Section>
      </main>
    </div>
  );
}

function ColorSwatch({ name, hex, color }: { name: string, hex: string, color: string }) {
  return (
    <Card className="p-0 overflow-hidden border-2" hoverEffect={true}>
      <div className={`h-24 w-full bg-${color}`} />
      <div className="p-4">
        <p className="text-xs font-pixel uppercase mb-1">{name}</p>
        <p className="text-[10px] text-text-secondary font-mono tracking-widest">{hex}</p>
      </div>
    </Card>
  );
}
