"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  Gamepad2, 
  Check, 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  Terminal,
  AlertCircle
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ItchGame } from "@/lib/itch";

interface ItchImportProps {
  onImportComplete: () => void;
  onCancel: () => void;
}

export const ItchImport = ({ onImportComplete, onCancel }: ItchImportProps) => {
  const [games, setGames] = useState<ItchGame[]>([]);
  const [status, setStatus] = useState<"idle" | "scanning" | "list" | "importing" | "success" | "error">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedGame, setSelectedGame] = useState<ItchGame | null>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `> ${msg}`].slice(-5));
  };

  const fetchGames = React.useCallback(async () => {
    setStatus("scanning");
    setLogs([]);

    const sequence = [
      "INITIALIZING SCAN_PROTOCOL...",
      "ACCESSING ITCH_DATA_NODE...",
      "FETCHING PUBLIC REPOSITORIES...",
      "PARSING METADATA SNAPSHOTS...",
      "SCAN COMPLETE."
    ];

    for (const msg of sequence) {
      addLog(msg);
      await new Promise(r => setTimeout(r, 500));
    }

    try {
      const res = await fetch("/api/user/itch/fetch");
      
      if (res.ok) {
        const data = await res.json();
        setGames(data);
        setStatus("list");
      } else {
        const errorText = await res.text();
        let errorMessage = "UNKNOWN_SYSTEM_FAILURE";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          errorMessage = `${res.status} ${res.statusText}`;
        }
        
        setStatus("error");
        addLog(`ERROR: ${errorMessage}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      addLog(`ERROR: ${err instanceof Error ? err.message : "FETCH_EXCEPTION"}`);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchGames();
    };
    init();
  }, [fetchGames]);

  const handleImport = async () => {
    if (!selectedGame) return;

    setStatus("importing");
    
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedGame.title,
          description: selectedGame.description,
          itchIoUrl: selectedGame.url,
          coverImage: selectedGame.coverImage,
          accent: "grass",
          tag: "Verified Build",
          verified: true,
          source: "itch",
          devStatus: "released"
        }),
      });

      if (res.ok) {
        setStatus("success");
        setTimeout(() => {
          onImportComplete();
        }, 2000);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <Card accent="grass" className="bg-zinc-900 border-grass/30 overflow-hidden min-h-[400px] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-grass" />
          <h3 className="text-[10px] font-pixel uppercase tracking-widest">Itch.io Import Protocol</h3>
        </div>
        <button onClick={onCancel} className="text-[8px] font-pixel text-text-secondary hover:text-white transition-colors">
          [ ABORT_MISSION ]
        </button>
      </div>

      <div className="flex-1 p-6 relative">
        <AnimatePresence mode="wait">
          {status === "scanning" && (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="bg-black/60 p-6 border border-grass/30 rounded-sm font-mono text-[11px] text-grass leading-relaxed h-48 flex flex-col justify-end shadow-[inset_0_0_20px_rgba(82,208,83,0.1)]">
                {logs.map((log, i) => (
                  <motion.p key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}>
                    {log}
                  </motion.p>
                ))}
                <motion.div 
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="w-2 h-4 bg-grass inline-block ml-1"
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-[9px] font-pixel text-grass animate-pulse">CONNECTING TO ITCH NETWORK...</p>
                <p className="text-[8px] font-pixel text-text-secondary">ESTABLISHING SECURE DATA TUNNEL</p>
              </div>
            </motion.div>
          )}

          {status === "list" && (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-pixel text-text-secondary">{games.length} REPOSITORIES DETECTED</p>
                <Badge variant="grass" className="text-[7px]">SELECT BUILD TO DEPLOY</Badge>
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {games.map((game, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedGame(game)}
                    className={`flex items-center gap-4 p-3 border-2 transition-all text-left group ${
                      selectedGame === game 
                        ? "border-grass bg-grass/10" 
                        : "border-border/40 bg-white/5 hover:border-border"
                    }`}
                  >
                    <div className="w-16 h-12 bg-black border border-white/10 overflow-hidden flex-shrink-0 relative">
                      {game.coverImage ? (
                        <Image src={game.coverImage} alt={game.title} width={64} height={48} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gamepad2 size={16} className="text-white/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[10px] font-pixel text-white truncate uppercase">{game.title}</h4>
                      <p className="text-[8px] font-sans text-text-secondary truncate mt-1">{game.url}</p>
                    </div>
                    {selectedGame === game && (
                      <Check size={14} className="text-grass flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-4 flex gap-4">
                <Button variant="secondary" className="flex-1 text-[9px] font-pixel h-10" onClick={onCancel}>BACK</Button>
                <Button 
                  variant="grass" 
                  className="flex-[2] text-[9px] font-pixel h-10" 
                  disabled={!selectedGame}
                  onClick={handleImport}
                >
                  DEPLOY SELECTED BUILD <ArrowRight size={14} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {status === "importing" && (
            <motion.div 
              key="importing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 space-y-6"
            >
              <Loader2 className="w-12 h-12 animate-spin text-grass mx-auto" />
              <div className="space-y-2">
                <p className="text-[10px] font-pixel text-white uppercase tracking-widest">DEPLOYING ARTIFACT...</p>
                <p className="text-[8px] font-pixel text-text-secondary animate-pulse">SYNCHRONIZING WITH PROJECT ARCHIVES</p>
              </div>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 space-y-8"
            >
              <div className="relative inline-block">
                <div className="w-20 h-20 bg-grass/20 rounded-full flex items-center justify-center mx-auto border-2 border-grass shadow-[0_0_30px_rgba(82,208,83,0.3)]">
                  <ShieldCheck size={40} className="text-grass" />
                </div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="absolute -top-2 -right-2 bg-white text-black p-1.5 rounded-sm border-2 border-grass font-pixel text-[8px]"
                >
                  VERIFIED
                </motion.div>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-pixel text-white uppercase">Build Repository Updated</h3>
                <div className="flex flex-col gap-2 items-center text-[9px] font-pixel">
                  <span className="text-grass">BUILD VERIFIED</span>
                  <span className="text-sky">PROJECT ARCHIVED</span>
                  <span className="text-architect-gold animate-bounce mt-4">+100 XP AWARDED</span>
                </div>
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 space-y-6"
            >
              <div className="w-16 h-16 bg-lava/20 border-2 border-lava rounded-full flex items-center justify-center mx-auto text-lava">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-pixel text-white uppercase px-6">
                  {logs.some(l => l.includes("PROFILE_NOT_LINKED") || l.includes("PROTOCOL_ERROR")) ? "Identity Not Found" : "Critical System Failure"}
                </p>
                <div className="text-[8px] font-pixel text-text-secondary px-8 leading-relaxed">
                  {logs.some(l => l.includes("PROFILE_NOT_LINKED") || l.includes("PROTOCOL_ERROR")) 
                    ? "Your Itch.io profile must be synchronized in the dashboard before importing." 
                    : (
                      <div className="space-y-1">
                        <p>An unexpected error occurred during the synchronization handshake.</p>
                        <p className="text-lava/80 font-mono mt-2">{logs[logs.length - 1]?.replace("> ", "") || "ERR_CONNECTION_FAILED"}</p>
                      </div>
                    )}
                </div>
              </div>
              {logs.some(l => l.includes("PROFILE_NOT_LINKED") || l.includes("PROTOCOL_ERROR")) ? (
                <Button variant="sky" size="sm" onClick={() => window.location.href = "/dashboard"}>
                  GO TO DASHBOARD
                </Button>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <Button variant="lava" size="sm" onClick={() => setStatus("idle")}>RETRY_HANDSHAKE</Button>
                  <button onClick={onCancel} className="text-[8px] font-pixel text-text-secondary hover:text-white transition-colors">
                    [ EXIT_PROTOCOL ]
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};
