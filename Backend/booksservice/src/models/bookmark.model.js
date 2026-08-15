import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

bookmarkSchema.index(
  {
    userId: 1,
    resourceId: 1,
  },
  {
    unique: true,
  },
);

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

export default Bookmark;
