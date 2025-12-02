export class JwtError extends Error {
  constructor(
    message: string,
    public code = "JWT_ERROR",
    public statusCode = 500,
  ) {
    super(message);
    this.name = "JwtError";
  }
}

export function createJwtError(
  message: string,
  statusCode = 500,
  code = "JWT_ERROR",
): JwtError {
  return new JwtError(message, code, statusCode);
}
