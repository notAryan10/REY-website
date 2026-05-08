"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Zap, Trophy, Shield } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { socket } from "@/lib/socket";

interface FeedItem {
  id: string;
  user: string;
  action: string;
  target: string;
  reward?: string;
  timestamp: Date;
  type: "completion" | "achievement" | "streak" | "promotion";
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<FeedItem[]>([]);
  const [now, setNow] = useState<number>(0);

  useEffect(() => {
    const updateTime = () => setNow(Date.now());
    updateTime();
    
    socket.connect();

    socket.on("operation:log_update", (newActivity: FeedItem) => {
      const item: FeedItem = {
        ...newActivity,
        timestamp: new Date(newActivity.timestamp)
      };
      setActivities(prev => [item, ...prev].slice(0, 10));
    });

    const timer = setInterval(updateTime, 60000);

    return () => {
      socket.off("operation:log_update");
      clearInterval(timer);
    };
  }, []);

  const getIcon = (type: FeedItem["type"]) => {
    switch (type) {
      case "completion": return <Zap size={14} className="text-architect-blue" />;
      case "achievement": return <Trophy size={14} className="text-architect-gold" />;
      case "streak": return <Activity size={14} className="text-architect-orange" />;
      case "promotion": return <Shield size={14} className="text-lava" />;
    }
  };

  return (
    <Card className="bg-architect-surface/60 border-white/10 h-full flex flex-col min-h-[500px]" hoverEffect={false}>
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
        <Activity size={18} className="text-architect-blue" />
        <h3 className="text-[10px] font-pixel text-white/80">COMMUNITY PULSE</h3>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 bg-white/5 border border-white/5 rounded-md flex gap-3 items-start group hover:bg-white/10 transition-colors"
            >
              <div className="mt-1">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] leading-relaxed">
                  <span className="text-white font-bold">{activity.user}</span>
                  <span className="text-text-secondary mx-1">{activity.action}</span>
                  <span className="text-white">{activity.target}</span>
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[8px] font-pixel text-architect-gold">{activity.reward}</span>
                  <span className="text-[8px] text-text-secondary uppercase">
                    {Math.floor((now - activity.timestamp.getTime()) / 60000)}M AGO
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 text-center">
        <p className="text-[8px] font-pixel text-text-secondary animate-pulse uppercase">
          Waiting for realtime sync...
        </p>
      </div>
    </Card>
  );
}
