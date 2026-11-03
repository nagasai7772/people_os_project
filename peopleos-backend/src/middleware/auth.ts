import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/tokens";
import { fail } from "../utils/http";
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return fail(res, "Authentication required", 401);
  try {
    req.user = verifyAccessToken(header.slice(7));
    next();
  } catch {
    return fail(res, "Invalid or expired access token", 401);
  }
}
export function authorize(...roles: Array<"ADMIN" | "MANAGER" | "EMPLOYEE">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return fail(res, "Authentication required", 401);
    if (!roles.includes(req.user.role)) return fail(res, "You do not have permission to perform this action", 403);
    next();
  };
}
