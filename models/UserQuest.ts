import mongoose from "mongoose";

const UserQuestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quest",
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    claimed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Compound index to ensure a user only has one entry per quest instance
UserQuestSchema.index({ userId: 1, questId: 1 }, { unique: true });

export default mongoose.models.UserQuest || mongoose.model("UserQuest", UserQuestSchema);
