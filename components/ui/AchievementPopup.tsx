"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { socket } from "@/lib/socket";
import { Trophy, Zap, Star } from "lucide-react";
import * as LucideIcons from "lucide-react";

// Map rarity to project theme colors
const RARITY_MAP: Record<string, "grass" | "lava" | "sky" | "sand" | "stone"> = {
  common: "stone",
  rare: "sky",
  epic: "lava",
  legendary: "sand",
  mythic: "grass",
};

const THEME_COLORS = {
  grass: "#4CAF50",
  lava: "#FF6B35",
  sky: "#5BC0EB",
  sand: "#FFD166",
  stone: "#242424",
};

export const AchievementPopup = () => {
  const [notification, setNotification] = useState<any>(null);

  useEffect(() => {
    socket.connect();

    socket.on("achievement:unlocked_success", (data) => {
      setNotification(data);
      
      // Auto-hide after 6 seconds
      setTimeout(() => {
        setNotification(null);
      }, 6000);
    });

    return () => {
      socket.off("achievement:unlocked_success");
    };
  }, []);

  if (!notification) return null;

  const accent = RARITY_MAP[notification.rarity] || "stone";
  const color = THEME_COLORS[accent];
  const IconComponent = (LucideIcons as any)[notification.icon] || Trophy;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.8 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4"
      >
        <div 
          className="bg-background border-2 p-6 relative overflow-hidden group shadow-2xl"
          style={{ borderColor: color, boxShadow: `0 0 40px ${color}40` }}
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundColor: color }} />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -top-12 -right-12 w-32 h-32 blur-3xl rounded-full" 
            style={{ backgroundColor: color, opacity: 0.2 }}
          />
          
          <div className="relative flex items-center gap-6">
            <div 
               className="w-16 h-16 flex items-center justify-center pixel-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] shrink-0"
               style={{ backgroundColor: color }}
            >
               <IconComponent size={32} className="text-white" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-pixel uppercase tracking-[0.2em] animate-pulse" style={{ color }}>
                  Achievement Unlocked!
                </p>
                <Badge 
                   variant={accent}
                   className="text-[7px] font-pixel px-1.5 py-0 border"
                >
                   {notification.rarity.toUpperCase()}
                </Badge>
              </div>
              <h3 className="text-sm font-pixel text-white uppercase tracking-tighter leading-tight">
                {notification.title}
              </h3>
              <div className="flex items-center gap-2">
                <Zap size={10} className="text-sand fill-sand" />
                <span className="text-[10px] font-pixel text-sand">+{notification.xpReward} XP REWARD</span>
              </div>
            </div>
          </div>
          
          {/* Progress Bar Timer */}
          <motion.div 
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 6, ease: "linear" }}
            className="absolute bottom-0 left-0 right-0 h-1 origin-left"
            style={{ backgroundColor: color }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
