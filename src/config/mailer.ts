import nodemailer from "nodemailer";
import { env } from "./env";

const transporter =
  env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      })
    : null;

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendMail(options: MailOptions) {
  if (!transporter) {
    console.warn("[mail] SMTP is not configured, skipping email");
    return;
  }
  await transporter.sendMail({ from: env.MAIL_FROM ?? env.SMTP_USER, ...options });
}
