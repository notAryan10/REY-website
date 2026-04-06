const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI missing from .env.local");
  process.exit(1);
}

// Minimal User Schema for Leaderboard
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  xp: { type: Number, default: 0 },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust for production security
  },
});

async function broadcastLeaderboard() {
  try {
    const topUsers = await User.find()
      .sort({ xp: -1 })
      .limit(10)
      .select("name xp role");
    io.emit("leaderboard:update", topUsers);
  } catch (err) {
    console.error("Failed to fetch leaderboard:", err);
  }
}

io.on("connection", async (socket) => {
  console.log("⚡ User connected:", socket.id);

  // Send initial leaderboard
  await broadcastLeaderboard();

  socket.on("xp:add", async ({ userId, action }) => {
    if (!userId || !action) return;

    let xpToAdd = 0;
    // SECURE XP CALCULATION
    if (action === "event_join") xpToAdd = 20;
    if (action === "project_upload") xpToAdd = 50;
    if (action === "workshop_attend") xpToAdd = 30;

    if (xpToAdd === 0) return;

    try {
      console.log(`✨ Adding ${xpToAdd} XP to ${userId} for ${action}`);
      await User.findByIdAndUpdate(userId, { $inc: { xp: xpToAdd } });
      await broadcastLeaderboard();
    } catch (err) {
      console.error("XP Update failed:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("👋 User disconnected:", socket.id);
  });
});

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    httpServer.listen(4000, () => {
      console.log("🚀 Socket server running on http://localhost:4000");
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
