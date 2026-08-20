import { cookies } from "next/headers";

const COOKIE = "yc_admin_session";
const encoder = new TextEncoder();

// 从标准环境变量读取
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const VIEWER_PASSWORD = process.env.VIEWER_PASSWORD || "viewer123";
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "default-secret-key-change-me";

export type AdminRole = "viewer" | "manager";

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(ADMIN_SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export async function getAdminRole(): Promise<AdminRole | null> {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature || signature !== await sign(payload)) return null;

  const [role, expiresValue] = payload.includes(":") ? payload.split(":") : ["manager", payload];
  if ((role !== "viewer" && role !== "manager") || Number(expiresValue) <= Date.now()) return null;
  return role;
}

export async function isAdmin() {
  return await getAdminRole() !== null;
}

export async function canDeleteApplications() {
  return await getAdminRole() === "manager";
}

export async function createAdminSession(role: AdminRole) {
  const expires = Date.now() + 1000 * 60 * 60 * 12;
  const payload = `${role}:${expires}`;
  (await cookies()).set(COOKIE, `${payload}.${await sign(payload)}`, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE);
}