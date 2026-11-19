import type { UploadApiResponse } from "cloudinary";
import { z } from "zod";
import { cloudinary, isCloudinaryConfigured } from "../../config/cloudinary";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";

const FOLDER = "amader-agency";

export const deleteImageSchema = z.object({
  publicId: z.string().min(1).max(300).startsWith(`${FOLDER}/`, "Invalid image id"),
});

function uploadBuffer(buffer: Buffer, folder: string) {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error("Upload failed"));
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

export const uploadImage = asyncHandler(async (req, res) => {
  if (!isCloudinaryConfigured) throw new ApiError(503, "Image upload is not configured");
  if (!req.file) throw new ApiError(400, 'No image received (send it as multipart field "file")');

  const sub = typeof req.query.folder === "string" && /^[a-z0-9-]{1,30}$/.test(req.query.folder)
    ? req.query.folder
    : "portfolio";

  const result = await uploadBuffer(req.file.buffer, `${FOLDER}/${sub}`);

  res.status(201).json({
    success: true,
    data: {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    },
  });
});

export const deleteImage = asyncHandler(async (req, res) => {
  if (!isCloudinaryConfigured) throw new ApiError(503, "Image upload is not configured");
  await cloudinary.uploader.destroy(req.body.publicId, { resource_type: "image" });
  res.json({ success: true, message: "Image deleted" });
});
