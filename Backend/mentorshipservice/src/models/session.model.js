import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    mentorId: {
      type: String,
      required: true,
      index: true,
    },

    studentId: {
      type: String,
      required: true,
      index: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    durationInMinutes: {
      type: Number,
      required: true,
      min: 15,
    },

    agenda: {
      type: String,
      default: "",
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
      index: true,
    },

    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
      default: null,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    mentorName: {
      type: String,
      default: "",
    },

    studentName: {
      type: String,
      default: "",
    },

    meetingLink: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const Session = mongoose.model("Session", sessionSchema);
