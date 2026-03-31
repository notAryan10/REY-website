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
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
