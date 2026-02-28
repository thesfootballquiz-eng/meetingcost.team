import { cookies } from "next/headers";
import crypto from "crypto";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours (match cookie maxAge)

function getAuthEnv() {
  return {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
    secret: process.env.SESSION_SECRET,
  };
}

export function isAuthConfigured(): boolean {
  const { username, password, secret } = getAuthEnv();
  return Boolean(username && password && secret);
}

export function getAuthConfigStatus(): { configured: boolean; missing: string[] } {
  const { username, password, secret } = getAuthEnv();
  const missing: string[] = [];
  if (!username) missing.push("ADMIN_USERNAME");
  if (!password) missing.push("ADMIN_PASSWORD");
  if (!secret) missing.push("SESSION_SECRET");
  return { configured: missing.length === 0, missing };
}

function requireSessionSecret(): string {
  const { secret } = getAuthEnv();
  if (!secret) {
    throw new Error("Auth not configured: missing SESSION_SECRET");
  }
  return secret;
}

function timingSafeHexEqual(aHex: string, bHex: string): boolean {
  try {
    if (aHex.length !== bHex.length) return false;
    const a = Buffer.from(aHex, "hex");
    const b = Buffer.from(bHex, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function generateToken(username: string): string {
  const secret = requireSessionSecret();
  const payload = `${username}:${Date.now()}`;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const signature = hmac.digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64");
}

export function verifyToken(token: string): boolean {
  try {
    const { secret } = getAuthEnv();
    if (!secret) return false;

    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length < 3) return false;
    const signature = parts.pop()!;
    const payload = parts.join(":");

    // Payload is expected to be "username:issuedAtMs" (username may contain ":" in theory)
    const issuedAtStr = parts[parts.length - 1];
    const issuedAt = Number(issuedAtStr);
    if (!Number.isFinite(issuedAt)) return false;
    if (Date.now() - issuedAt > TOKEN_TTL_MS) return false;

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payload);
    const expected = hmac.digest("hex");
    return timingSafeHexEqual(signature, expected);
  } catch {
    return false;
  }
}

export function validateCredentials(
  username: string,
  password: string
): boolean {
  const { username: adminUser, password: adminPass } = getAuthEnv();
  if (!adminUser || !adminPass) return false;
  return username === adminUser && password === adminPass;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  return verifyToken(token);
}
