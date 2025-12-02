import {createHmac} from "node:crypto";

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= (a.codePointAt(i) ?? 0) ^ (b.codePointAt(i) ?? 0);
  }

  return result === 0;
}

export function createHmacSignature(message: string, secret: string): string {
  return createHmac("sha256", secret).update(message).digest("hex");
}

export function createSessionMessage(
  sessionId: string,
  randomValue: string,
): string {
  return `${String(sessionId.length)}!${sessionId}!${String(randomValue.length)}!${randomValue}`;
}
