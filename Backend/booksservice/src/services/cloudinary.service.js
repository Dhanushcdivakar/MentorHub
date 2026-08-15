import fs from "fs";
import path from "path";

import cloudinary from "../config/cloudinary.config.js";
import ApiError from "../utils/ApiError.js";

const isCloudinaryConfigured = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  return (
    name &&
    name !== "your_cloud_name" &&
    key &&
    key !== "your_api_key" &&
    secret &&
    secret !== "your_api_secret"
  );
};

export const uploadFile = async (
  file,
  folder = process.env.CLOUDINARY_FOLDER || "mentorhub/resources",
) => {
  if (!file) {
    throw new ApiError(400, "File is required.");
  }

  const filePath = file.path;

  if (!isCloudinaryConfigured()) {
    console.log(
      "Cloudinary is not configured or uses placeholders. Saving locally.",
    );
    const fileUrl = `http://localhost:5005/uploads/${file.filename}`;
    return {
      publicId: `local_${file.filename}`,
      url: fileUrl,
      format: path.extname(file.originalname).substring(1),
      size: file.size,
      originalName: file.originalname,
    };
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto",
    });

    // Delete local temporary file
    try {
      await fs.promises.unlink(filePath);
    } catch (err) {
      console.error("Failed to delete temp file:", err);
    }

    return {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      size: result.bytes,
      originalName: file.originalname,
    };
  } catch (error) {
    console.error("Cloudinary upload failed with error:", error);
    // Delete local temporary file even on failure
    try {
      await fs.promises.unlink(filePath);
    } catch (err) {
      console.error("Failed to delete temp file on error:", err);
    }
    throw new ApiError(500, `Failed to upload file to Cloudinary: ${error.message || error}`);
  }
};

export const deleteFile = async (publicId) => {
  if (!publicId) {
    return;
  }

  if (publicId.startsWith("local_")) {
    const filename = publicId.substring(6);
    const filePath = path.join(process.cwd(), "uploads", filename);
    try {
      await fs.promises.unlink(filePath);
      console.log("Local file deleted successfully:", filename);
    } catch (err) {
      console.error("Failed to delete local file:", err);
    }
    return;
  }

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "auto",
  });
};
