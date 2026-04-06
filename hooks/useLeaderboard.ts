import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

export function useLeaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onUpdate = (data: any[]) => setLeaders(data);

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
