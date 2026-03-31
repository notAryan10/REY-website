import mongoose from "mongoose";

const GameJamSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a jam title"],
    },
    status: {
      type: String,
      required: true,
    },
    statusVariant: {
      type: String,
      required: true,
    },
    timeLeft: {
      type: String, 
      required: true,
    },
    participants: {
      type: String,
      required: true,
    },
    prize: {
      type: String,
      required: true,
    },
    accent: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.GameJam || mongoose.model("GameJam", GameJamSchema);
