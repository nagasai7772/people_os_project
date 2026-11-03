import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
export function notFound(_req: Request, res: Response) {
  res.status(404).json({ success: false, message: "Route not found" });
}
export function errorHandler(error: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(error);
  if (error instanceof ZodError) return res.status(400).json({ success: false, message: "Validation failed", details: error.flatten() });
  if (error.code === "23505") return res.status(409).json({ success: false, message: "A record with this value already exists" });
  if (error.code === "23503") return res.status(400).json({ success: false, message: "Related record does not exist or is still in use" });
  res.status(500).json({ success: false, message: env.NODE_ENV === "production" ? "Internal server error" : error.message });
}
