import { Response } from "express";
export function ok(res: Response, data: unknown, message = "Success", status = 200) {
  return res.status(status).json({ success: true, message, data });
}
export function fail(res: Response, message: string, status = 400, details?: unknown) {
  return res.status(status).json({ success: false, message, ...(details ? { details } : {}) });
}
export function pagination(pageValue: unknown, limitValue: unknown) {
  const page = Math.max(1, Number(pageValue) || 1);
  const limit = Math.min(100, Math.max(1, Number(limitValue) || 10));
  return { page, limit, offset: (page - 1) * limit };
}
