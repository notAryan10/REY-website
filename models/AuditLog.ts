import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    subject: {
      type: String, // User ID or Entity ID
      required: true,
    },
    subjectName: {
      type: String, // Human readable name
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actorName: {
      type: String,
      required: true,
    },
    actorRole: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "SUCCESS",
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export default mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
