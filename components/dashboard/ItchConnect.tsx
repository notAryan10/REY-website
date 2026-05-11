"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gamepad2, Link as LinkIcon, Check, Loader2, 
  Terminal, AlertCircle, Copy, ExternalLink, ShieldCheck 
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface ItchConnectProps {
  initialUsername?: string;
  initialConnected?: boolean;
  initialVerified?: boolean;
  verificationToken?: string;
  onSuccess?: () => void;
}

export const ItchConnect = ({ 
  initialUsername = "", 
  initialConnected = false,
  initialVerified = false,
  verificationToken = "",
  onSuccess 
}: ItchConnectProps) => {
  const [username, setUsername] = useState(initialUsername);
  const [isConnected, setIsConnected] = useState(initialConnected);
  const [isVerified, setIsVerified] = useState(initialVerified);
  const [token, setToken] = useState(verificationToken);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<"idle" | "scanning" | "success" | "error" | "needs_verify">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ATOMIC SYNC: Update local state when props change
  useEffect(() => {
    if (initialConnected !== undefined) setIsConnected(initialConnected);
    if (initialVerified !== undefined) setIsVerified(initialVerified);
    if (initialUsername) setUsername(initialUsername);
    if (verificationToken && verificationToken !== token) setToken(verificationToken);
  }, [initialConnected, initialVerified, initialUsername, verificationToken]);

  // Countdown logic for expiration
  useEffect(() => {
    if (expiresAt) {
      if (countdownRef.current) clearInterval(countdownRef.current);
      
      countdownRef.current = setInterval(() => {
        const now = new Date().getTime();
        const distance = expiresAt.getTime() - now;
        
        if (distance < 0) {
          setTimeLeft("EXPIRED");
          if (countdownRef.current) clearInterval(countdownRef.current);
        } else {
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeLeft(`${minutes}m ${seconds}s`);
        }
      }, 1000);
    }
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [expiresAt]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg].slice(-5));
  };

  const handleConnect = async () => {
    let processedUsername = username.trim();
    // ... same extraction logic ...
    const finalUsername = (processedUsername || initialUsername).toLowerCase().replace(/_/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
    if (!finalUsername) return;
    
    setIsProcessing(true);
    setStatus("scanning");
    setLogs([]);
    
    const sequence = [
      "INITIALIZING ITCH_NET_PROTOCOL...",
      "STRICT_DOMAIN_VAL: SUCCESS",
      "PINGING ITCH.IO SERVERS...",
      `SEARCHING FOR SECTOR: ${finalUsername.toUpperCase()}`,
      "HANDSHAKE REQUESTED...",
      "GENERATING SECURITY TOKEN...",
      "TOKEN_EXPIRY_SET: 30M",
      "IDENTITY LOCATED."
    ];

    for (const msg of sequence) {
      addLog(msg);
      await new Promise(r => setTimeout(r, 300));
    }

    try {
      const res = await fetch("/api/user/itch/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itchUsername: finalUsername }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsConnected(true);
        const newToken = data.token || data.user?.itchVerificationToken;
        setToken(newToken);
        if (data.expires) setExpiresAt(new Date(data.expires));
        setStatus("idle"); 
        if (onSuccess) onSuccess();
      } else {
        setStatus("error");
        addLog(`ERROR: ${data.error || "PROTOCOL REJECTED"}`);
      }
    } catch (err) {
      setStatus("error");
      addLog("ERROR: SYSTEM TIMEOUT.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerify = async () => {
    setIsProcessing(true);
    setStatus("scanning");
    setLogs([]);

    const sequence = [
      "RE-ESTABLISHING CONNECTION...",
      "ACCESSING PROFILE DATA...",
      "SCANNING MULTI-SECTOR DOMAINS...",
      `LOCATING TOKEN: ${token}`,
      "VERIFYING DEPLOYMENT SIGNATURE...",
      "TOKEN_DETECTED: MATCH_CONFIRMED",
      "AUTHENTICATING DEVELOPER..."
    ];

    for (const msg of sequence) {
      addLog(msg);
      await new Promise(r => setTimeout(r, 500));
    }

    try {
      const res = await fetch("/api/user/itch/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        setIsVerified(true);
        setStatus("success");
        setToken(""); // Clear token in UI after success
        if (onSuccess) onSuccess();
      } else {
        setStatus("error");
        addLog(`ERROR: ${data.error || "HANDSHAKE FAILED"}`);
        if (data.details) addLog(`INFO: ${data.details}`);
      }
    } catch (err) {
      setStatus("error");
      addLog("ERROR: VERIFICATION TIMEOUT.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnect = async () => {
    if (!confirm("ABORT SYNC: Are you sure you want to decouple this Itch.io profile?")) return;
    
    try {
      const res = await fetch("/api/user/itch/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itchUsername: "", disconnect: true }),
      });

      if (res.ok) {
        setIsConnected(false);
        setIsVerified(false);
        setUsername("");
        setToken("");
        setExpiresAt(null);
        setStatus("idle");
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card accent={isVerified ? "grass" : isConnected ? "sand" : "sky"} className="bg-zinc-900/40 border-border/50 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-sm ${isVerified ? "bg-grass/10 text-grass" : isConnected ? "bg-sand/10 text-sand" : "bg-sky/10 text-sky"}`}>
            <Gamepad2 size={18} />
          </div>
          <h3 className="text-xs font-pixel uppercase tracking-widest">Itch.io Synchronization</h3>
        </div>
        {isVerified ? (
          <Badge variant="grass" className="text-[8px] font-pixel">SYNC_ACTIVE</Badge>
        ) : isConnected ? (
          <Badge variant="sand" className="text-[8px] font-pixel">PENDING_VERIFY</Badge>
        ) : null}
      </div>

      <AnimatePresence mode="wait">
        {status === "scanning" ? (
          <motion.div 
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 py-4"
          >
            <div className="bg-black/60 p-4 border border-sky/30 rounded-sm font-mono text-[10px] text-sky leading-relaxed h-32 flex flex-col justify-end">
              {logs.map((log, i) => (
                <motion.p key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}>
                  {`> ${log}`}
                </motion.p>
              ))}
              <motion.div 
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-2 h-3 bg-sky inline-block ml-1"
              />
            </div>
            <p className="text-[8px] font-pixel text-text-secondary animate-pulse text-center uppercase">
              SCANNING ITCH_NETWORK SECTORS...
            </p>
          </motion.div>
        ) : isVerified ? (
           <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-4"
          >
            <div className="w-16 h-16 bg-grass/20 border-2 border-grass rounded-full flex items-center justify-center mx-auto text-grass shadow-[0_0_20px_rgba(82,208,83,0.2)]">
              <ShieldCheck size={32} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-pixel text-white uppercase tracking-tighter">Identity Verified</p>
              <p className="text-[10px] font-sans text-text-secondary">Network Status: <span className="text-grass">LINKED_AND_SECURE</span></p>
            </div>
            
            <div className="pt-4 flex flex-col items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[8px] font-pixel hover:text-sky uppercase"
                onClick={() => {
                  setIsVerified(false);
                  setIsConnected(true);
                  setStatus("idle");
                }}
              >
                [ REVERIFY NETWORK ]
              </Button>
              <button 
                onClick={handleDisconnect}
                className="text-[8px] font-pixel text-text-secondary hover:text-lava uppercase transition-colors"
              >
                [ DECOUPLE_PROFILE ]
              </button>
            </div>
          </motion.div>
        ) : isConnected ? (
          <motion.div 
            key="verify"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-pixel text-white uppercase">Ownership Handshake</p>
                <p className="text-[8px] font-pixel text-text-secondary">TARGET: <span className="text-sand">{username || initialUsername}</span></p>
              </div>
              {timeLeft && (
                <div className="text-right">
                  <p className="text-[8px] font-pixel text-text-secondary uppercase">Window Closes In</p>
                  <p className={`text-[10px] font-pixel ${timeLeft === "EXPIRED" ? "text-lava" : "text-sand"}`}>{timeLeft}</p>
                </div>
              )}
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Paste this token into your Itch.io profile bio or a project description to confirm ownership:
            </p>

            <div className="flex gap-2">
              <div className={`flex-1 bg-black/40 border-2 border-dashed p-3 font-mono text-sm text-center tracking-widest ${
                token 
                  ? "border-sand/30 text-sand" 
                  : "border-lava/30 text-lava/60 text-xs"
              }`}>
                {token || "⚠ TOKEN_EXPIRED"}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCopy} 
                className={`px-4 border-2 transition-all ${
                  copied 
                    ? "border-grass text-grass" 
                    : "border-border"
                }`} 
                disabled={!token}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </Button>
            </div>

            {status === "error" && (
              <div className="p-3 bg-lava/10 border border-lava/30 rounded-sm flex items-center gap-3 text-lava">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span className="text-[8px] font-pixel uppercase leading-tight">
                  {logs[logs.length - 1]?.replace("> ", "") || "Verification Failed"}
                </span>
              </div>
            )}

            {!token || timeLeft === "EXPIRED" ? (
              <Button 
                variant="sky" 
                className="w-full text-[9px] font-pixel h-11" 
                onClick={handleConnect}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="animate-spin mr-2" size={14} /> : <Terminal className="mr-2" size={14} />}
                REGENERATE HANDSHAKE TOKEN
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button 
                  variant="grass" 
                  className="flex-1 text-[9px] font-pixel h-11" 
                  onClick={handleVerify}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader2 className="animate-spin mr-2" size={14} /> : <ShieldCheck className="mr-2" size={14} />}
                  VERIFY HANDSHAKE
                </Button>
                <button 
                  onClick={handleDisconnect}
                  className="px-4 text-[8px] font-pixel text-text-secondary hover:text-lava uppercase transition-colors"
                >
                  [ ABORT ]
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <p className="text-xs text-text-secondary leading-relaxed">
              Link your Itch.io network identity to archive your builds and synchronize project metadata.
            </p>
            
            <div className="space-y-2">
              <label className="text-[9px] font-pixel uppercase text-text-secondary tracking-widest flex items-center gap-2">
                <Terminal size={12} className="text-sky" /> Itch Profile URL
              </label>
              <div className="flex gap-2">
                <input 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="https://not-aryan.itch.io/"
                  disabled={isProcessing}
                  className="flex-1 bg-black/40 border-2 border-border p-3 text-xs font-pixel text-white focus:border-sky outline-none transition-all placeholder:opacity-20"
                />
                <Button 
                  variant="sky" 
                  size="sm" 
                  onClick={handleConnect}
                  disabled={isProcessing || !username.trim()}
                  className="px-6 h-12"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <LinkIcon size={14} />}
                </Button>
              </div>
            </div>

            {status === "error" && (
              <div className="p-3 bg-lava/10 border border-lava/30 rounded-sm flex items-center gap-3 text-lava">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span className="text-[8px] font-pixel uppercase">
                  {logs[logs.length - 1]?.replace("> ", "") || "Identity not detected"}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Gamepad2 size={80} />
      </div>
    </Card>
  );
};
