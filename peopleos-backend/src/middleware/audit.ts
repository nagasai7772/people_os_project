import { Request, Response, NextFunction } from "express";
import { query } from "../database/pool";
export function audit(action: string, entityType: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    resOnFinish(req, action, entityType);
    next();
  };
}
function resOnFinish(req: Request, action: string, entityType: string) {
  const originalEnd = (req as any).res?.end;
  if (!originalEnd) return;
  (req as any).res.end = function (...args: any[]) {
    if ((req as any).res.statusCode < 400 && req.user) {
      void query("INSERT INTO audit_logs(actor_user_id, action, entity_type, metadata, ip_address) VALUES($1,$2,$3,$4,$5)",
        [req.user.id, action, entityType, JSON.stringify({ method: req.method, path: req.originalUrl }), req.ip]).catch(console.error);
    }
    return originalEnd.apply(this, args);
  };
}
