import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";

// Used so a missing account takes about as long as a wrong password.
const DUMMY_HASH = bcrypt.hashSync("amader-agency-dummy-password", 10);

const publicAdmin = { id: true, name: true, email: true, createdAt: true } as const;

export async function login(email: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { email } });
  const valid = await bcrypt.compare(password, admin?.password ?? DUMMY_HASH);
  if (!admin || !valid) throw new ApiError(401, "Invalid email or password");

  const token = jwt.sign({ id: admin.id, email: admin.email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_DAYS * 24 * 60 * 60,
  });

  return { token, admin: { id: admin.id, name: admin.name, email: admin.email } };
}

export async function getMe(id: string) {
  const admin = await prisma.admin.findUnique({ where: { id }, select: publicAdmin });
  if (!admin) throw new ApiError(401, "Account no longer exists");
  return admin;
}

export async function changePassword(id: string, currentPassword: string, newPassword: string) {
  const admin = await prisma.admin.findUnique({ where: { id } });
  if (!admin) throw new ApiError(401, "Account no longer exists");

  const valid = await bcrypt.compare(currentPassword, admin.password);
  if (!valid) throw new ApiError(400, "Current password is incorrect");

  await prisma.admin.update({
    where: { id },
    data: { password: await bcrypt.hash(newPassword, 12) },
  });
}
