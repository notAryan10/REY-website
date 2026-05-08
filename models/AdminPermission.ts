import mongoose from "mongoose";

const AdminPermissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    tier: {
      type: String,
      enum: ["Founder", "Core Architect", "Moderator"],
      required: true,
    },
    permissions: [
      {
        type: String,
        enum: [
          "FULL_ACCESS",
          "MANAGE_ADMINS",
          "MODIFY_USERS",
          "MODIFY_XP",
          "MODIFY_LEVELS",
          "MANAGE_ACHIEVEMENTS",
          "DELETE_CONTENT",
          "SYSTEM_CONTROL",
          "MANAGE_EVENTS",
          "MANAGE_RESOURCES",
          "MODERATE_COMMUNITY",
          "REVIEW_CONTENT"
        ],
      },
    ],
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.models.AdminPermission || mongoose.model("AdminPermission", AdminPermissionSchema);
