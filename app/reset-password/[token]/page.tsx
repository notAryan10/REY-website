"use client";

import React, { useState } from "react";
import { Lock, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = useParams();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center p-6 pt-32">
        <div className="w-full max-w-md">
          <Section title="New Identity" subtitle="reforge your key" accent="grass" className="!py-0">
             <Card accent="grass" className="relative p-12 bg-card/80 backdrop-blur-md">
                {success ? (
                  <div className="text-center space-y-6 py-8">
                    <div className="flex justify-center">
                      <CheckCircle2 className="w-16 h-16 text-grass animate-bounce" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-pixel uppercase tracking-widest text-white">Access Restored</h3>
                      <p className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary">
                        Your key has been updated. Redirecting to terminal...
                      </p>
                    </div>
                    <Button variant="grass" onClick={() => router.push("/login")} className="w-full">
                      Go to Login
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="bg-lava/10 border border-lava/20 p-3 text-[10px] uppercase font-pixel tracking-tighter text-lava animate-shake">
                        {error}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary">New Secret Key</label>
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

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-pixel tracking-widest text-text-secondary">Confirm Secret Key</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input 
                          type="password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          placeholder="••••••••" 
                          className="w-full bg-stone/20 border-2 border-border p-3 pl-10 text-xs font-sans text-white focus:border-grass outline-none placeholder:text-stone/40"
                        />
                      </div>
                    </div>

                    <Button variant="grass" type="submit" disabled={isLoading} className="w-full py-4 text-lg">
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                        </div>
                      ) : (
                        "Update Key"
                      )}
                    </Button>

                    <div className="pt-4 text-center">
                      <Link href="/login" className="inline-flex items-center gap-2 text-[10px] uppercase font-pixel tracking-widest text-text-secondary hover:text-white transition-colors">
                        <ArrowLeft size={12} /> Back to Login
                      </Link>
                    </div>
                  </form>
                )}
             </Card>
          </Section>
        </div>
      </main>
    </div>
  );
}
