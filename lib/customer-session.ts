import { cookies } from "next/headers";
import { getIronSession } from "iron-session";

export type CustomerSession = {
  userId: string;
};

const COOKIE_NAME = "customer_session";
const TTL = 60 * 60 * 24 * 30; // 30 days

function getPassword(): string {
  const secret = process.env.CUSTOMER_SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  // In non-production, allow running without the secret (dev fallback)
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "CUSTOMER_SESSION_SECRET is missing or too short. Using a dev fallback. Add CUSTOMER_SESSION_SECRET to .env (min 32 chars) for production."
    );
    return "dev-fallback-secret-min-32-chars-long-do-not-use-in-production";
  }
  throw new Error(
    "CUSTOMER_SESSION_SECRET must be set in .env (min 32 characters) for customer auth."
  );
}

export async function getCustomerSession() {
  const cookieStore = await cookies();
  return getIronSession<CustomerSession>(cookieStore, {
    cookieName: COOKIE_NAME,
    password: getPassword(),
    ttl: TTL,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  });
}
