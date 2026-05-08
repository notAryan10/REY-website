import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== "undefined" ? undefined : "http://localhost:3000");

export const socket = io(SOCKET_URL || "", {
    autoConnect: false,
});

