import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      unique: true,
      index: true,
    },

    meetingLink: {
      type: String,
      required: true,
    },

    provider: {
      type: String,
      enum: ["jitsi"],
      default: "jitsi",
    },

    status: {
      type: String,
      enum: ["scheduled", "started", "ended"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  },
);

export const Meeting = mongoose.model("Meeting", meetingSchema);
