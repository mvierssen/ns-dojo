import {createHash, randomBytes} from "node:crypto";
import {vi} from "vitest";

function toBase64Url(input: Buffer): string {
  return input
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

async function mockHash(password: string, saltRounds: number): Promise<string> {
  const cost = String(saltRounds).padStart(2, "0");
  const salt = toBase64Url(randomBytes(16));
  const digest = createHash("sha256")
    .update(`${password}:${salt}:${String(saltRounds)}`)
    .digest();
  const encoded = toBase64Url(digest);
  return `$2b$${cost}$${salt}$${encoded}`;
}

async function mockCompare(password: string, hash: string): Promise<boolean> {
  const match = /^\$2b\$(\d{2})\$([^$]+)\$([^$]+)$/u.exec(hash);
  if (!match) return false;
  const [, costStr, salt, expected] = match;
  const rounds = Number.parseInt(costStr, 10);
  if (!Number.isFinite(rounds)) return false;

  const digest = createHash("sha256")
    .update(`${password}:${salt}:${String(rounds)}`)
    .digest();
  const actual = toBase64Url(digest);
  return actual === expected;
}

vi.mock("bcrypt", () => ({
  default: {
    hash: mockHash,
    compare: mockCompare,
  },
  hash: mockHash,
  compare: mockCompare,
}));
