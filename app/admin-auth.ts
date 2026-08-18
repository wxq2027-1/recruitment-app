import { env } from "cloudflare:workers";
import { cookies } from "next/headers";

const COOKIE = "yc_admin_session";
const encoder = new TextEncoder();
const adminEnv = env as unknown as { ADMIN_PASSWORD?: string; ADMIN_SESSION_SECRET?: string };

async function sign(value: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(adminEnv.ADMIN_SESSION_SECRET || ""), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(signature))).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export async function isAdmin() {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value || !adminEnv.ADMIN_SESSION_SECRET) return false;
  const [payload, signature] = value.split(".");
  if (!payload || !signature || signature !== await sign(payload)) return false;
  return Number(payload) > Date.now();
}

export async function createAdminSession() {
  const expires = Date.now() + 1000 * 60 * 60 * 12;
  const payload = String(expires);
  (await cookies()).set(COOKIE, `${payload}.${await sign(payload)}`, { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 60 * 60 * 12 });
}

export async function clearAdminSession() { (await cookies()).delete(COOKIE); }
