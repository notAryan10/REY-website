import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide an event title"],
    },
    description: {
      type: String,
      required: [true, "Please provide an event description"],
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["event", "gamejam", "workshop"],
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accent: {
      type: String,
      enum: ["lava", "grass", "sky", "sand"],
      default: "sky",
    },
    location: String,
    players: String,
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
