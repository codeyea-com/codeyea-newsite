import { randomUUID } from "node:crypto";
import { AppError } from "./errors";

const endpoint = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function turnstilePublicConfig() {
  const siteKey = process.env.TURNSTILE_SITE_KEY?.trim();
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  const required =
    process.env.NODE_ENV === "production" ||
    process.env.TURNSTILE_REQUIRED === "true";
  const ready = Boolean(siteKey && secret);
  return { required, ready, siteKey: ready ? siteKey : null };
}

export async function verifyTurnstile(token: unknown) {
  const siteKey = process.env.TURNSTILE_SITE_KEY?.trim();
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  const required =
    process.env.NODE_ENV === "production" ||
    process.env.TURNSTILE_REQUIRED === "true";

  if (!siteKey && !secret && !required) return;
  if (!siteKey || !secret)
    throw new AppError(503, "Form security is not configured yet. Please try again later.");
  if (typeof token !== "string" || !token.trim() || token.length > 2048)
    throw new AppError(400, "Complete the security check before submitting.");

  const allowedHostnames = (
    process.env.TURNSTILE_ALLOWED_HOSTNAMES ||
    new URL(process.env.BETTER_AUTH_URL || "http://localhost").hostname
  )
    .split(",")
    .map((hostname) => hostname.trim().toLowerCase())
    .filter(Boolean);

  let result: { success?: boolean; hostname?: string; action?: string };
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
        idempotency_key: randomUUID(),
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Siteverify unavailable");
    result = await response.json();
  } catch {
    throw new AppError(503, "The security check is temporarily unavailable. Please try again.");
  }

  if (
    result.success !== true ||
    !result.hostname ||
    !allowedHostnames.includes(result.hostname.toLowerCase()) ||
    result.action !== "lead"
  )
    throw new AppError(400, "The security check expired or was not accepted. Please try again.");
}
