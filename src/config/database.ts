import { env } from "./env";

export const dbHost = new URL(env.DATABASE_URL).hostname;
