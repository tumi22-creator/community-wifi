import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

const secret: string = JWT_SECRET;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  passwordHash: string
) {
  return bcrypt.compare(password, passwordHash);
}

export function generateToken(userId: string) {
  return jwt.sign(
    { userId },
    secret,
    {
      expiresIn: "1d",
    }
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, secret);
}