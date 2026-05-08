import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { User } from "@/types";

export type LeaderboardEntry = Pick<User, "_id" | "name" | "role" | "xp">;

export function useLeaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onUpdate = (data: LeaderboardEntry[]) => setLeaders(data);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("leaderboard:update", onUpdate);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("leaderboard:update", onUpdate);
    };
  }, []);

  const addXP = (userId: string, action: string) => {
    socket.emit("xp:add", { userId, action });
  };

  return { leaders, connected, addXP };
}
