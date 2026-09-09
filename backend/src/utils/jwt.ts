import jwt from "jsonwebtoken";

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === "") {
    throw new Error(
      "FATAL SECURITY ERROR: JWT_SECRET environment variable is not defined. Server refusing to execute with insecure token signing."
    );
  }
  return secret;
}

const JWT_EXPIRES_IN = "7d"; // 7-day token expiration

export interface JwtPayload {
  userId: string;
  email: string;
  plan: string;
}

export function generateJwtToken(user: { id: string; email: string; plan?: string }): string {
  const secret = getJwtSecret();
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    plan: user.plan || "free",
  };

  return jwt.sign(payload, secret, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: "HS256",
  });
}

export function verifyJwtToken(token: string): JwtPayload | null {
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return decoded;
  } catch (err) {
    return null;
  }
}
