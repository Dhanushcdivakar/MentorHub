import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "BOOK",
        "PDF",
        "ARTICLE",
        "VIDEO",
        "EXTERNAL_LINK",
        "DOCUMENTATION",
      ],
      index: true,
    },

    difficulty: {
      type: String,
      enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
      default: "BEGINNER",
      index: true,
    },

    language: {
      type: String,
      default: "English",
      trim: true,
      index: true,
    },

    author: {
      type: String,
      trim: true,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    thumbnail: {
      publicId: String,
      url: String,
    },

    resourceFile: {
      publicId: String,
      url: String,
      originalName: String,
      format: String,
      size: Number,
    },

    externalUrl: {
      type: String,
      trim: true,
    },

    estimatedReadTime: {
      type: Number,
      default: 0,
    },

    totalViews: {
      type: Number,
      default: 0,
    },

    totalDownloads: {
      type: Number,
      default: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalRatings: {
      type: Number,
      default: 0,
    },

    totalBookmarks: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "ARCHIVED"],
      default: "ACTIVE",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

resourceSchema.index({
  title: "text",
  description: "text",
  author: "text",
  tags: "text",
});

resourceSchema.index({
  category: 1,
  difficulty: 1,
});

resourceSchema.index({
  mentorId: 1,
  createdAt: -1,
});

resourceSchema.index({
  averageRating: -1,
});

resourceSchema.index({
  totalViews: -1,
});

resourceSchema.index({
  totalDownloads: -1,
});

const Resource = mongoose.model("Resource", resourceSchema);

export default Resource;
