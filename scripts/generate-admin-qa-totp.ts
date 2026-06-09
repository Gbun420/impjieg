import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// ---------------------------------------------------------------------------
// TOTP code generator for QA admin account
// Uses the same algorithm as src/lib/admin-mfa.ts
// ---------------------------------------------------------------------------

const QA_TOTP_DIGITS = 6;
const QA_TOTP_PERIOD_SECONDS = 30;

function base32Decode(value: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const normalized = value.replace(/=+$/g, "").replace(/\s+/g, "").toUpperCase();
  let bits = 0;
  let buffer = 0;
  const output: number[] = [];

  for (const char of normalized) {
    const index = alphabet.indexOf(char);
    if (index === -1) throw new Error("Invalid base32 secret");
    buffer = (buffer << 5) | index;
    bits += 5;
    if (bits >= 8) {
      output.push((buffer >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

function generateTotpCode(
  secret: string,
  timestamp: number = Date.now()
): string {
  const key = base32Decode(secret);
  const counter = Math.floor(timestamp / 1000 / QA_TOTP_PERIOD_SECONDS);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const hmac = crypto.createHmac("sha1", key).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (binary % 10 ** QA_TOTP_DIGITS).toString().padStart(QA_TOTP_DIGITS, "0");
}

function loadCredentialsFile(): string | null {
  const credPath = path.resolve(process.cwd(), "output/qa-dashboard-credentials.local.md");
  if (!fs.existsSync(credPath)) return null;
  return fs.readFileSync(credPath, "utf8");
}

function extractTotpSecret(content: string): string | null {
  const match = content.match(/QA TOTP Secret.*?:\s*`([A-Z2-7]+)`/);
  return match?.[1] ?? null;
}

function main() {
  const content = loadCredentialsFile();
  if (!content) {
    console.error(
      "Credentials file not found. Run 'npm run qa:seed-dashboard-profiles' first."
    );
    process.exitCode = 1;
    return;
  }

  const secret = extractTotpSecret(content);
  if (!secret) {
    console.error("QA TOTP secret not found in credentials file.");
    process.exitCode = 1;
    return;
  }

  const now = Date.now();
  const code = generateTotpCode(secret, now);
  const nextCode = generateTotpCode(secret, now + QA_TOTP_PERIOD_SECONDS * 1000);
  const secondsLeft =
    QA_TOTP_PERIOD_SECONDS - (Math.floor(now / 1000) % QA_TOTP_PERIOD_SECONDS);

  console.log("QA Admin TOTP Code");
  console.log("==================");
  console.log(`Email:  qa.admin+dashboard@impjieg.test`);
  console.log(`Code:   ${code}`);
  console.log(`Next:   ${nextCode} (in ${secondsLeft}s)`);
  console.log(`Secret: ${secret}`);
  console.log("");
  console.log("⚠️  QA only. Do not use in production.");
}

main();
