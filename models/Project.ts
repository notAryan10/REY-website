import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String, // e.g., "The Great Library"
      required: [true, "Please provide a project title"],
    },
    description: {
      type: String, // e.g., "A massive community build project..."
      required: true,
    },
    accent: {
      type: String, // "lava", "grass", "sky"
      required: true,
    },
    tag: {
      type: String, // e.g., "Featured Project"
      required: true,
    },
    itchIoUrl: {
      type: String, // e.g., "https://notaryan10.itch.io/rey-world"
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "published"],
      default: "published",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
