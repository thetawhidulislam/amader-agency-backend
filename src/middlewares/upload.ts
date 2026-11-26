import multer from "multer";
import { ApiError } from "../utils/ApiError";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) return cb(null, true);
    cb(new ApiError(400, "Only JPG, PNG, WEBP and AVIF images are allowed"));
  },
});
