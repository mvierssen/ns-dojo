import * as bcrypt from "bcrypt";

export const DEFAULT_SALT_ROUNDS = 12;

export async function hashPassword(
  password: string,
  saltRounds = DEFAULT_SALT_ROUNDS,
): Promise<string> {
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
