import "dotenv/config";
import { z } from "zod";

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? v.trim() : undefined));

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_DAYS: z.coerce.number().int().positive().default(7),

  FRONTEND_URL: z.string().url("FRONTEND_URL must be a valid URL"),
  CORS_ORIGINS: optionalString,
  COOKIE_DOMAIN: optionalString,
  COOKIE_SAMESITE: z.enum(["lax", "strict", "none"]).default("lax"),
  REVALIDATE_SECRET: z.string().min(16, "REVALIDATE_SECRET must be at least 16 characters"),

  CLOUDINARY_CLOUD_NAME: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,

  SMTP_HOST: optionalString,
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: optionalString,
  SMTP_PASS: optionalString,
  MAIL_FROM: optionalString,
  LEAD_NOTIFY_EMAIL: optionalString,
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  for (const issue of parsed.error.issues) {
    console.error(` - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = {
  ...parsed.data,
  FRONTEND_URL: parsed.data.FRONTEND_URL.replace(/\/+$/, ""),
};

export const isProd = env.NODE_ENV === "production";
