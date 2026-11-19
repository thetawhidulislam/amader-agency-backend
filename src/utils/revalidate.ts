import { env } from "../config/env";

/**
 * Tells the Next.js frontend to refresh cached pages (ISR) for the given tags.
 * Fire-and-forget: a failure never breaks the API response.
 */
export async function revalidateFrontend(tags: string[]) {
  try {
    const res = await fetch(`${env.FRONTEND_URL}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": env.REVALIDATE_SECRET,
      },
      body: JSON.stringify({ tags }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.warn(`[revalidate] frontend responded ${res.status}`);
  } catch (err) {
    console.warn("[revalidate] could not reach frontend:", (err as Error).message);
  }
}
