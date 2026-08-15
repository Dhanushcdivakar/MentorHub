import mongoose from "mongoose";

const socialLinksSchema = new mongoose.Schema(
  {
    github: {
      type: String,
      default: "",
    },

    linkedin: {
      type: String,
      default: "",
    },

    portfolio: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  },
);

const dayAvailabilitySchema = new mongoose.Schema(
  {
    active: {
      type: Boolean,
      default: false,
    },
    from: {
      type: String,
      default: "09:00",
    },
    to: {
      type: String,
      default: "17:00",
    },
  },
  {
    _id: false,
  },
);

const availabilitySchema = new mongoose.Schema(
  {
    monday: {
      type: dayAvailabilitySchema,
      default: () => ({ active: true, from: "09:00", to: "17:00" }),
    },
    tuesday: {
      type: dayAvailabilitySchema,
      default: () => ({ active: true, from: "09:00", to: "17:00" }),
    },
    wednesday: {
      type: dayAvailabilitySchema,
      default: () => ({ active: true, from: "09:00", to: "17:00" }),
    },
    thursday: {
      type: dayAvailabilitySchema,
      default: () => ({ active: true, from: "09:00", to: "17:00" }),
    },
    friday: {
      type: dayAvailabilitySchema,
      default: () => ({ active: true, from: "09:00", to: "16:00" }),
    },
    saturday: {
      type: dayAvailabilitySchema,
      default: () => ({ active: false, from: "10:00", to: "14:00" }),
    },
    sunday: {
      type: dayAvailabilitySchema,
      default: () => ({ active: false, from: "10:00", to: "14:00" }),
    },
  },
  {
    _id: false,
  },
);

const userSchema = new mongoose.Schema(
  {
    authId: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    role: {
      type: String,
      enum: ["student", "mentor", "admin"],
      required: true,
    },

    bio: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    experience: {
      type: Number,
      default: 0,
    },

    profilePicture: {
      type: String,
      default: "",
    },

    socialLinks: {
      type: socialLinksSchema,
      default: () => ({}),
    },

    availability: {
      type: availabilitySchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("User", userSchema);
