import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a resource title"],
    },
    fileUrl: {
      type: String,
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
    accessLevel: {
      type: String,
      enum: ["public", "members"],
      default: "public",
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    size: String,
    type: String, 
    accent: {
      type: String,
      default: "sky",
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
ResourceSchema.index({ accessLevel: 1, createdAt: -1 });
ResourceSchema.index({ eventId: 1 });

export default mongoose.models.Resource || mongoose.model("Resource", ResourceSchema);
