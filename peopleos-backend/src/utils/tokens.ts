import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";
import { Role } from "../types/roles";
export type TokenUser = { id: string; email: string; role: Role; employeeId: string | null };
export function signAccessToken(user: TokenUser) {
  return jwt.sign(user, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"] });
}
export function signRefreshToken(user: TokenUser) {
  return jwt.sign({ id: user.id, tokenType: "refresh" }, env.JWT_REFRESH_SECRET, { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"] });
}
export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenUser;
}
export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string; tokenType: string };
}
export const sha256 = (value: string) => crypto.createHash("sha256").update(value).digest("hex");
