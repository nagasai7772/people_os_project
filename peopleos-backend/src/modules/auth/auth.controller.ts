import { Request, Response } from "express";
import { z } from "zod";
import { query } from "../../database/pool";
import { ok, fail } from "../../utils/http";
import { asyncHandler } from "../../utils/asyncHandler";
import { comparePassword } from "../../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken, sha256 } from "../../utils/tokens";
import { env } from "../../config/env";

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
function publicUser(row: any) {
  return { id: row.id, name: row.name, email: row.email, role: row.role, employeeId: row.employee_id };
}
export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = loginSchema.parse(req.body);
  const result = await query("SELECT * FROM users WHERE LOWER(email)=LOWER($1)", [body.email]);
  const user = result.rows[0];
  if (!user || user.status !== "ACTIVE" || !(await comparePassword(body.password, user.password_hash))) return fail(res, "Invalid email or password", 401);
  await query("UPDATE users SET last_login_at=NOW() WHERE id=$1", [user.id]);
  const tokenUser = { id: user.id, email: user.email, role: user.role, employeeId: user.employee_id };
  const accessToken = signAccessToken(tokenUser);
  const refreshToken = signRefreshToken(tokenUser);
  const decoded = verifyRefreshToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 86400000);
  await query("INSERT INTO refresh_tokens(user_id, token_hash, expires_at) VALUES($1,$2,$3)", [user.id, sha256(refreshToken), expiresAt]);
  return ok(res, { user: publicUser(user), accessToken, refreshToken }, "Login successful");
});
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = z.string().min(1).parse(req.body.refreshToken);
  let payload;
  try { payload = verifyRefreshToken(token); } catch { return fail(res, "Invalid refresh token", 401); }
  const stored = await query("SELECT id FROM refresh_tokens WHERE user_id=$1 AND token_hash=$2 AND revoked_at IS NULL AND expires_at>NOW()", [payload.id, sha256(token)]);
  if (!stored.rowCount) return fail(res, "Refresh token revoked or expired", 401);
  await query("UPDATE refresh_tokens SET revoked_at=NOW() WHERE id=$1", [stored.rows[0].id]);
  const found = await query("SELECT id,email,role,employee_id,name,status FROM users WHERE id=$1", [payload.id]);
  const user = found.rows[0];
  if (!user || user.status !== "ACTIVE") return fail(res, "User is unavailable", 401);
  const tokenUser = { id: user.id, email: user.email, role: user.role, employeeId: user.employee_id };
  const accessToken = signAccessToken(tokenUser);
  const refreshToken = signRefreshToken(tokenUser);
  await query("INSERT INTO refresh_tokens(user_id,token_hash,expires_at) VALUES($1,$2,NOW()+INTERVAL '7 days')", [user.id, sha256(refreshToken)]);
  return ok(res, { accessToken, refreshToken, user: publicUser(user) }, "Token refreshed");
});
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.body.refreshToken;
  if (token) await query("UPDATE refresh_tokens SET revoked_at=NOW() WHERE user_id=$1 AND token_hash=$2 AND revoked_at IS NULL", [req.user!.id, sha256(String(token))]);
  return ok(res, null, "Logged out");
});
export const me = asyncHandler(async (req: Request, res: Response) => {
  const result = await query("SELECT id,name,email,role,employee_id,status,last_login_at FROM users WHERE id=$1", [req.user!.id]);
  if (!result.rowCount) return fail(res, "User not found", 404);
  return ok(res, result.rows[0]);
});
