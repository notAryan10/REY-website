"use client";

import React from "react";
import { Lock, Mail, Globe, Shield } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 pt-32">
        <div className="w-full max-w-md">
          <Section title="Sign In" subtitle="access your portal" accent="grass" className="!py-0">
             <Card accent="grass" className="relative p-12 bg-card/80 backdrop-blur-md">
                <form className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary">Email Address</label>
                      <div className="relative">
                         <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                         <input 
                           type="email" 
                           placeholder="architect@rey.net" 
                           className="w-full bg-stone/20 border-2 border-border p-3 pl-10 text-xs font-sans text-white focus:border-grass outline-none placeholder:text-stone/40"
                         />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary">Secret Key</label>
                      <div className="relative">
                         <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                         <input 
                           type="password" 
                           placeholder="••••••••" 
                           className="w-full bg-stone/20 border-2 border-border p-3 pl-10 text-xs font-sans text-white focus:border-grass outline-none placeholder:text-stone/40"
                         />
                      </div>
                   </div>

                   <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase font-pixel tracking-widest text-stone hover:text-white cursor-pointer transition-colors underline">Forgot Key?</p>
                   </div>

                   <Button variant="grass" className="w-full py-4 text-lg">
                      Authenticate
                   </Button>
                </form>

                <div className="mt-8 pt-8 border-t border-border/50 text-center space-y-6">
                   <p className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary">// Alternative Channels</p>
                   <div className="flex gap-4">
                      <Button variant="secondary" className="flex-1 text-[10px] group">
                         <Globe size={16} className="mr-2 group-hover:text-white transition-colors" /> Discord
                      </Button>
                      <Button variant="secondary" className="flex-1 text-[10px] group">
                         <Shield size={16} className="mr-2 group-hover:text-white transition-colors" /> Google
                      </Button>
                   </div>
                </div>
             </Card>
          </Section>
        </div>
      </main>
    </div>
  );
}
