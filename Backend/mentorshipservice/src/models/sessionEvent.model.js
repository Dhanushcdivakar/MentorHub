import mongoose from "mongoose";

const sessionEventSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },

    eventType: {
      type: String,
      enum: [
        "SESSION_CREATED",
        "SESSION_ACCEPTED",
        "SESSION_REJECTED",
        "SESSION_COMPLETED",
        "SESSION_CANCELLED",
        "MEETING_CREATED",
        "REVIEW_ADDED",
      ],
      required: true,
      index: true,
    },

    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    versionKey: false,
  },
);

export const SessionEvent = mongoose.model("SessionEvent", sessionEventSchema);
