import mongoose from "mongoose";

const QuestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["login", "events", "resources", "projects", "community", "elite", "hidden"],
      required: true,
    },
    xpReward: {
      type: Number,
      required: true,
    },
    rarity: {
      type: String,
      enum: ["common", "rare", "epic", "legendary", "mythic"],
      default: "common",
    },
    requirement: {
      type: Number,
      default: 1, // e.g., login 1 time, download 1 resource
    },
    hidden: {
      type: Boolean,
      default: false,
    },
    isActive: {
        type: Boolean,
        default: true
    }
  },
  { timestamps: true }
);

export default mongoose.models.Quest || mongoose.model("Quest", QuestSchema);
