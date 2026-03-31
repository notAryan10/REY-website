import mongoose from "mongoose";

const WorkshopSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a workshop title"],
    },
    lessons: {
      type: String, 
      required: true,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Elite"],
      default: "Beginner",
    },
    time: {
      type: String, 
      required: true,
    },
    accent: {
      type: String,
      enum: ["sky", "grass", "lava", "sand"],
      default: "sky",
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    requiredRole: {
      type: String,
      enum: ["architect", "respawner", "spectator"],
      default: "spectator",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Workshop || mongoose.model("Workshop", WorkshopSchema);
