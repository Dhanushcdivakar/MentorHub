import fs from "fs";
import path from "path";
import multer from "multer";

import ApiError from "../utils/ApiError.js";
import { env } from "../config/env.config.js";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: env.upload.maxFileSize,
  },

  fileFilter: (req, file, cb) => {
    if (!env.upload.allowedTypes.includes(file.mimetype)) {
      return cb(new ApiError(400, "Unsupported file type."));
    }

    cb(null, true);
  },
});

export default upload;
