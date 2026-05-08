import mongoose from "mongoose";

const AchievementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    xpReward: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ["Events", "Learning", "Projects", "Resources", "Community", "Elite", "Hidden", "Game Jams"],
      default: "Community",
    },
    rarity: {
      type: String,
      enum: ["common", "rare", "epic", "legendary", "mythic"],
      default: "common",
    },
    requirementType: {
      type: String, // e.g., 'event_attend', 'project_upload'
      required: false,
    },
    requirementValue: {
      type: Number,
      default: 1,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String, // String representation of Lucide icon name or a custom icon key
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Achievement || mongoose.model("Achievement", AchievementSchema);
