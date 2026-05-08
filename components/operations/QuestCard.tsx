"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  CheckCircle2, 
  Clock, 
  Shield, 
  Target, 
  Layout, 
  Users, 
  Lock,
  Terminal,
  Loader2
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { socket } from "@/lib/socket";
import { useSession } from "next-auth/react";

interface QuestCardProps {
  userQuest: any;
  onComplete: () => void;
}

export function QuestCard({ userQuest, onComplete }: QuestCardProps) {
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const { questId: quest, progress, completed } = userQuest;

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/quests/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuestId: userQuest._id })
      });
      if (res.ok) {
        const data = await res.json();
        
        // Emit socket event if completed
        if (data.userQuest.completed) {
            socket.emit("operation:complete", {
                user: session?.user?.name || "Anonymous",
                action: "completed",
                target: quest.title,
                reward: `+${quest.xpReward} XP`,
                type: "completion"
            });
        }
        
        onComplete();
      }
    } catch (err) {
      console.error("Failed to complete quest:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const progressPercentage = Math.min((progress / quest.requirement) * 100, 100);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "text-architect-green";
      case "rare": return "text-architect-blue";
      case "epic": return "text-architect-orange";
      case "legendary": return "text-architect-gold";
      case "mythic": return "text-lava";
      default: return "text-white";
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case "login": return <Clock size={20} />;
      case "events": return <Users size={20} />;
      case "resources": return <Layout size={20} />;
      case "projects": return <Zap size={20} />;
      case "community": return <Target size={20} />;
      case "elite": return <Shield size={20} />;
      default: return <Terminal size={20} />;
    }
  };

  return (
    <Card 
      className={`relative group bg-architect-surface/40 border-white/10 transition-all duration-300 ${
        completed ? "border-architect-green/30 bg-architect-green/5" : "hover:border-white/20"
      }`}
      hoverEffect={!completed}
    >
      {/* Top Section */}
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg bg-white/5 ${getRarityColor(quest.rarity)}`}>
          {getIcon(quest.category)}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="stone" className="text-[8px] py-0">{quest.rarity.toUpperCase()}</Badge>
          <div className="flex items-center gap-1 text-architect-gold font-pixel text-[10px]">
            <Zap size={10} />
            +{quest.xpReward}
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="mb-6">
        <h4 className={`text-sm font-bold mb-1 ${completed ? 'text-architect-green' : 'text-white'}`}>
          {quest.title}
        </h4>
        <p className="text-[10px] text-text-secondary leading-relaxed font-sans">
          {quest.description}
        </p>
      </div>

      {/* Bottom Section */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[8px] font-pixel text-text-secondary">
            <span>PROGRESS</span>
            <span>{progress} / {quest.requirement}</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className={`h-full ${completed ? 'bg-architect-green shadow-[0_0_10px_rgba(82,208,83,0.5)]' : 'bg-architect-blue'}`}
            />
          </div>
        </div>

        {completed ? (
          <div className="flex items-center justify-center gap-2 py-2 text-architect-green font-pixel text-[9px] bg-architect-green/10 border border-architect-green/20 rounded-md">
            <CheckCircle2 size={12} />
            MISSION COMPLETE
          </div>
        ) : (
          <Button 
            variant="stone" 
            size="sm" 
            className="w-full text-[9px] h-9"
            onClick={handleComplete}
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              "REPORT STATUS"
            )}
          </Button>
        )}
      </div>

      {/* Scanline Overlay Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%]" />
    </Card>
  );
}
