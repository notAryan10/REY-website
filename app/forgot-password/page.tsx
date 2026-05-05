"use client";

import React, { useState } from "react";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center p-6 pt-32">
        <div className="w-full max-w-md">
          <Section title="Reset Access" subtitle="request a new key" accent="grass" className="!py-0">
             <Card accent="grass" className="relative p-12 bg-card/80 backdrop-blur-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-lava/10 border border-lava/20 p-3 text-[10px] uppercase font-pixel tracking-tighter text-lava animate-shake">
                      {error}
                    </div>
                  )}
                  {message && (
                    <div className="bg-grass/10 border border-grass/20 p-3 text-[10px] uppercase font-pixel tracking-tighter text-grass">
                      {message}
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

                  <Button variant="grass" type="submit" disabled={isLoading} className="w-full py-4 text-lg">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                      </div>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>

                  <div className="pt-4 text-center">
                    <Link href="/login" className="inline-flex items-center gap-2 text-[10px] uppercase font-pixel tracking-widest text-text-secondary hover:text-white transition-colors">
                      <ArrowLeft size={12} /> Back to Login
                    </Link>
                  </div>
                </form>
             </Card>
          </Section>
        </div>
      </main>
    </div>
  );
}
