import crypto from "node:crypto";
import type { CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getAdminToken } from "./admin-session";

export const ADMIN_MFA_CHALLENGE_COOKIE = "impjieg_admin_mfa_challenge";
const ADMIN_MFA_DEFAULT_ISSUER = "Impjieg";
const ADMIN_MFA_DEFAULT_DIGITS = 6;
const ADMIN_MFA_DEFAULT_PERIOD_SECONDS = 30;
const ADMIN_MFA_DEFAULT_WINDOW = 1;
const ADMIN_MFA_ENCRYPTION_CONTEXT = "impjieg-admin-mfa-secret";
const ADMIN_MFA_CHALLENGE_MAX_AGE = 60 * 10;

export type AdminMfaMode = "login" | "setup";

export type AdminMfaChallenge = {
  userId: string;
  email: string;
  mode: AdminMfaMode;
  secret?: string;
  issuedAt: number;
};

function toBase64Url(value: Buffer | string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url");
}

function getMfaSigningSecret() {
  return getAdminToken();
}

function getMfaEncryptionKey() {
  return crypto.createHash("sha256").update(`${getAdminToken()}:${ADMIN_MFA_ENCRYPTION_CONTEXT}`).digest();
}

function base32Encode(bytes: Buffer) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let output = "";
  let bits = 0;
  let value = 0;

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  return output;
}

function base32Decode(value: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const normalized = value.replace(/=+$/g, "").replace(/\s+/g, "").toUpperCase();
  let bits = 0;
  let buffer = 0;
  const output: number[] = [];

  for (const char of normalized) {
    const index = alphabet.indexOf(char);
    if (index === -1) {
      throw new Error("Invalid base32 secret");
    }

    buffer = (buffer << 5) | index;
    bits += 5;

    if (bits >= 8) {
      output.push((buffer >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

function normalizeTotpCode(code: string, digits: number) {
  const normalized = code.replace(/\s+/g, "").trim();
  if (!/^\d+$/.test(normalized)) {
    return null;
  }

  return normalized.padStart(digits, "0").slice(-digits);
}

function createChallengeSignature(payload: string) {
  return crypto
    .createHmac("sha256", getMfaSigningSecret())
    .update(payload)
    .digest("base64url");
}

export function serializeAdminMfaChallenge(challenge: AdminMfaChallenge) {
  const payload = toBase64Url(JSON.stringify(challenge));
  const signature = createChallengeSignature(payload);

  return `${payload}.${signature}`;
}

export function parseAdminMfaChallenge(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parts = value.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [payload, signature] = parts;
  if (!payload || !signature) {
    return null;
  }

  if (createChallengeSignature(payload) !== signature) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(payload).toString("utf8")) as AdminMfaChallenge;
    if (
      !parsed ||
      typeof parsed.userId !== "string" ||
      typeof parsed.email !== "string" ||
      (parsed.mode !== "login" && parsed.mode !== "setup") ||
      typeof parsed.issuedAt !== "number"
    ) {
      return null;
    }

    if (parsed.secret !== undefined && typeof parsed.secret !== "string") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function generateAdminMfaSecret() {
  return base32Encode(crypto.randomBytes(20));
}

export function buildAdminOtpAuthUri({
  email,
  secret,
  issuer = ADMIN_MFA_DEFAULT_ISSUER,
}: {
  email: string;
  secret: string;
  issuer?: string;
}) {
  const label = `${issuer}:${email}`;
  return `otpauth://totp/${encodeURIComponent(label)}?secret=${encodeURIComponent(secret)}&issuer=${encodeURIComponent(issuer)}&digits=${ADMIN_MFA_DEFAULT_DIGITS}&period=${ADMIN_MFA_DEFAULT_PERIOD_SECONDS}`;
}

export function generateTotpCode(
  secret: string,
  {
    timestamp = Date.now(),
    digits = ADMIN_MFA_DEFAULT_DIGITS,
    periodSeconds = ADMIN_MFA_DEFAULT_PERIOD_SECONDS,
  }: {
    timestamp?: number;
    digits?: number;
    periodSeconds?: number;
  } = {}
) {
  const key = base32Decode(secret);
  const counter = Math.floor(timestamp / 1000 / periodSeconds);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const hmac = crypto.createHmac("sha1", key).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const code = (binary % 10 ** digits).toString().padStart(digits, "0");

  return code;
}

export function verifyTotpCode(
  secret: string,
  code: string,
  {
    timestamp = Date.now(),
    digits = ADMIN_MFA_DEFAULT_DIGITS,
    periodSeconds = ADMIN_MFA_DEFAULT_PERIOD_SECONDS,
    window = ADMIN_MFA_DEFAULT_WINDOW,
  }: {
    timestamp?: number;
    digits?: number;
    periodSeconds?: number;
    window?: number;
  } = {}
) {
  const normalizedCode = normalizeTotpCode(code, digits);
  if (!normalizedCode) {
    return false;
  }

  for (let drift = -window; drift <= window; drift++) {
    const candidateTimestamp = timestamp + drift * periodSeconds * 1000;
    if (generateTotpCode(secret, { timestamp: candidateTimestamp, digits, periodSeconds }) === normalizedCode) {
      return true;
    }
  }

  return false;
}

export function encryptAdminMfaSecret(secret: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getMfaEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function decryptAdminMfaSecret(encryptedSecret: string) {
  const payload = Buffer.from(encryptedSecret, "base64url");
  const iv = payload.subarray(0, 12);
  const tag = payload.subarray(12, 28);
  const encrypted = payload.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", getMfaEncryptionKey(), iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export function createAdminMfaChallenge(challenge: AdminMfaChallenge) {
  return serializeAdminMfaChallenge(challenge);
}

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export async function setAdminMfaChallengeCookie(
  challenge: AdminMfaChallenge,
  cookieStore?: CookieStore
) {
  const store = cookieStore ?? (await cookies());
  store.set(ADMIN_MFA_CHALLENGE_COOKIE, serializeAdminMfaChallenge(challenge), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: ADMIN_MFA_CHALLENGE_MAX_AGE,
  } satisfies CookieOptions);
}

export async function clearAdminMfaChallengeCookie(cookieStore?: CookieStore) {
  const store = cookieStore ?? (await cookies());
  store.set(ADMIN_MFA_CHALLENGE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 0,
  } satisfies CookieOptions);
}

export async function readAdminMfaChallengeCookie(cookieStore?: CookieStore) {
  const store = cookieStore ?? (await cookies());
  return parseAdminMfaChallenge(store.get(ADMIN_MFA_CHALLENGE_COOKIE)?.value);
}
