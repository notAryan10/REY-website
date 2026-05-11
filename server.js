/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require("http");
const { parse } = require("url");
const { Server } = require("socket.io");
const next = require("next");
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

console.log("📍 Current Working Directory:", process.cwd());
const app = next({ dev, hostname, port, dir: process.cwd() });
const handle = app.getRequestHandler();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI missing from environment");
  process.exit(1);
}

// Minimal User Schema for Leaderboard
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: { type: String, select: false },
  role: { 
    type: String, 
    enum: ["Founder", "Core Architect", "Moderator", "architect", "respawner", "spectator"],
    default: "spectator" 
  },
  status: {
    type: String,
    enum: ["active", "suspended", "maintenance"],
    default: "active",
  },
  xp: { type: Number, default: 0 },
  eventWins: { type: Number, default: 0 },
  projectsLed: { type: Number, default: 0 },
  itchConnected: { type: Boolean, default: false },
  itchUsername: { type: String, default: "" },
  itchVerificationToken: { type: String, default: "" },
  itchVerified: { type: Boolean, default: false },
  itchVerifiedAt: Date,
  itchVerificationExpires: Date,
  achievements: [
    {
      achievementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Achievement",
      },
      progress: {
        type: Number,
        default: 0,
      },
      unlocked: {
        type: Boolean,
        default: false,
      },
      unlockedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

// Minimal AuditLog Schema
const AuditLogSchema = new mongoose.Schema({
  action: String,
  subject: String,
  subjectName: String,
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  actorName: String,
  actorRole: String,
  status: { type: String, default: "SUCCESS" },
  details: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);

// Minimal Achievement Schema
const AchievementSchema = new mongoose.Schema({
  title: String,
  description: String,
  xpReward: Number,
  category: String,
  rarity: String,
  requirementType: String,
  requirementValue: Number,
  hidden: Boolean,
  icon: String,
});

const Achievement = mongoose.models.Achievement || mongoose.model("Achievement", AchievementSchema);

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  async function broadcastLeaderboard() {
    try {
      const topUsers = await User.find()
        .sort({ xp: -1 })
        .limit(10);
      io.emit("leaderboard:update", topUsers);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    }
  }

  io.on("connection", async (socket) => {
    console.log("⚡ User connected:", socket.id);
    await broadcastLeaderboard();

    socket.on("xp:add", async ({ userId, action }) => {
      if (!userId || !action) return;

      let xpToAdd = 0;
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

    socket.on("achievement:unlock", async ({ userId, achievementId }) => {
      if (!userId || !achievementId) return;

      try {
        const user = await User.findById(userId);
        if (!user) return;

        // Check if already unlocked
        const alreadyUnlocked = user.achievements.some(a => a.achievementId.toString() === achievementId && a.unlocked);
        if (alreadyUnlocked) return;

        const achievement = await Achievement.findById(achievementId);
        if (!achievement) return;

        console.log(`🏆 Unlocking Achievement: ${achievement.title} for ${userId}`);
        
        const achievementIndex = user.achievements.findIndex(a => a.achievementId.toString() === achievementId);
        if (achievementIndex > -1) {
          user.achievements[achievementIndex].unlocked = true;
          user.achievements[achievementIndex].unlockedAt = new Date();
          user.achievements[achievementIndex].progress = achievement.requirementValue;
        } else {
          user.achievements.push({ 
            achievementId, 
            unlocked: true, 
            unlockedAt: new Date(),
            progress: achievement.requirementValue 
          });
        }
        
        user.xp += achievement.xpReward;
        await user.save();

        // Target emission for the popup
        socket.emit("achievement:unlocked_success", {
          title: achievement.title,
          xpReward: achievement.xpReward,
          icon: achievement.icon,
          rarity: achievement.rarity,
        });

        await broadcastLeaderboard();
      } catch (err) {
        console.error("Achievement unlock failed:", err);
      }
    });

    socket.on("achievement:progress", async ({ userId: _userId, requirementType: _requirementType, amount: _amount = 1 }) => {
      // ... existing code
    });

    socket.on("admin:action", async (logData) => {
      try {
        console.log(`📜 Logging Admin Action: ${logData.action} by ${logData.actorName}`);
        const log = await AuditLog.create({
          ...logData,
          createdAt: new Date()
        });
        io.emit("admin:log_update", log);
      } catch (err) {
        console.error("Audit Logging failed:", err);
      }
    });

    socket.on("operation:complete", async (data) => {
      try {
        console.log(`🎯 Quest Completed: ${data.target} by ${data.user}`);
        // Broadcast to all connected clients for the activity feed
        io.emit("operation:log_update", {
          ...data,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date()
        });
      } catch (err) {
        console.error("Operation broadcast failed:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("👋 User disconnected:", socket.id);
    });
  });

  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log("✅ Connected to MongoDB");
      httpServer.listen(port, () => {
        console.log(`🚀 Server running on http://${hostname}:${port}`);
      });
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
    });
});

