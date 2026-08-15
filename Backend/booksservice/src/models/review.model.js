import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    review: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

reviewSchema.index(
  {
    resourceId: 1,
    userId: 1,
  },
  {
    unique: true,
  },
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
