import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      select: false,
    },
    role: {
      type: String,
      enum: ["Founder", "Core Architect", "Moderator", "architect", "respawner", "spectator"],
      default: "spectator",
    },
    status: {
      type: String,
      enum: ["active", "suspended", "maintenance"],
      default: "active",
    },
    image: {
      type: String,
      default: "",
    },
    xp: {
      type: Number,
      default: 0,
    },
    eventWins: {
      type: Number,
      default: 0,
    },
    projectsLed: {
      type: Number,
      default: 0,
    },
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
    itchConnected: {
      type: Boolean,
      default: false,
    },
    itchUsername: {
      type: String,
      default: "",
    },
    itchVerificationToken: {
      type: String,
      default: "",
    },
    itchVerified: {
      type: Boolean,
      default: false,
    },
    itchVerifiedAt: {
      type: Date,
    },
    itchVerificationExpires: {
      type: Date,
    },
    quests: [
      {
        title: String,
        reward: String,
        status: {
          type: String,
          enum: ["In Progress", "Reviewing", "Completed"],
          default: "In Progress",
        },
      },
    ],
  },
  { timestamps: true }
);

// Indexes for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ xp: -1 });
UserSchema.index({ role: 1 });

export default mongoose.models.User || mongoose.model("User", UserSchema);
