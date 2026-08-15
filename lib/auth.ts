import { createHmac } from "crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24; // 24 hours

function getSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SECRET is not set. Add it to .env for admin auth.");
  }
  return secret;
}

export function signSession(): string {
  const secret = getSecret();
  const payload = JSON.stringify({ at: Date.now() });
  const hex = Buffer.from(payload, "utf8").toString("hex");
  const hmac = createHmac("sha256", secret);
  hmac.update(hex);
  const sig = hmac.digest("hex");
  return `${hex}.${sig}`;
}

export function verifySession(token: string): boolean {
  try {
    const secret = getSecret();
    const [hex, sig] = token.split(".");
    if (!hex || !sig) return false;
    const hmac = createHmac("sha256", secret);
    hmac.update(hex);
    if (hmac.digest("hex") !== sig) return false;
    const payload = JSON.parse(Buffer.from(hex, "hex").toString("utf8"));
    if (!payload.at || Date.now() - payload.at > MAX_AGE * 1000) return false;
    return true;
  } catch {
    return false;
  }
}

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return !!token && verifySession(token);
}

export async function setAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, signSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}
