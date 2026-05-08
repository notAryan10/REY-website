"use client";

import React, { useState, Suspense } from "react";
import { Lock, Mail, Globe, Shield, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setError("Invalid credentials. Try again.");
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-lava/10 border border-lava/20 p-3 text-[10px] uppercase font-pixel tracking-tighter text-lava animate-shake">
          {error}
        </div>
      )}
      
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••" 
            className="w-full bg-stone/20 border-2 border-border p-3 pl-10 text-xs font-sans text-white focus:border-grass outline-none placeholder:text-stone/40"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link href="/forgot-password" className="text-[10px] uppercase font-pixel tracking-widest text-stone hover:text-white transition-colors underline">Forgot Key?</Link>
        <Link href="/register" className="text-[10px] uppercase font-pixel tracking-widest text-grass hover:text-white transition-colors underline">Create Account</Link>
      </div>

      <Button variant="grass" type="submit" disabled={isLoading} className="w-full py-4 text-lg">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
          </div>
        ) : (
          "Authenticate"
        )}
      </Button>

      <div className="mt-8 pt-8 border-t border-border/50 text-center space-y-6">
        <p className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary">// Alternative Channels</p>
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              type="button"
              className="flex-1 text-[10px] group"
              onClick={() => signIn("discord", { callbackUrl })}
            >
              <Globe size={16} className="mr-2 group-hover:text-white transition-colors" /> Discord
            </Button>
            <Button 
              variant="secondary" 
              type="button"
              className="flex-1 text-[10px] group"
              onClick={() => signIn("google", { callbackUrl })}
            >
              <Shield size={16} className="mr-2 group-hover:text-white transition-colors" /> Google
            </Button>
          </div>
          <Button 
            variant="secondary" 
            type="button"
            className="w-full text-[10px] group"
            onClick={() => signIn("github", { callbackUrl })}
          >
            <Lock size={16} className="mr-2 group-hover:text-white transition-colors" /> GitHub
          </Button>
        </div>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center p-6 pt-32">
        <div className="w-full max-w-md">
          <Section title="Sign In" subtitle="access your portal" accent="grass" className="!py-0">
             <Card accent="grass" className="relative p-12 bg-card/80 backdrop-blur-md">
                <Suspense fallback={
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-grass" />
                    <p className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary">Initiating Handshake...</p>
                  </div>
                }>
                  <LoginForm />
                </Suspense>
             </Card>
          </Section>
        </div>
      </main>
    </div>
  );
}
