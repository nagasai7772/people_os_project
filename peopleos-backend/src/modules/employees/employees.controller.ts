import { Request, Response } from "express";
import { z } from "zod";
import { query } from "../../database/pool";
import { ok, fail, pagination } from "../../utils/http";
import { asyncHandler } from "../../utils/asyncHandler";
const employeeSchema = z.object({
  employee_code: z.string().min(2).max(30), first_name: z.string().min(1).max(80), last_name: z.string().min(1).max(80),
  official_email: z.string().email(), personal_email: z.string().email().optional().nullable(), phone: z.string().optional().nullable(),
  date_of_birth: z.string().optional().nullable(), gender: z.string().optional().nullable(), address: z.string().optional().nullable(),
  department_id: z.string().uuid().optional().nullable(), designation_id: z.string().uuid().optional().nullable(),
  manager_id: z.string().uuid().optional().nullable(), employment_type: z.string().optional(), employment_status: z.string().optional(),
  joining_date: z.string().optional().nullable(), work_location: z.string().optional().nullable(),
  emergency_contact_name: z.string().optional().nullable(), emergency_contact_phone: z.string().optional().nullable(), notes: z.string().optional().nullable()
});
const fields = ["employee_code","first_name","last_name","official_email","personal_email","phone","date_of_birth","gender","address","department_id","designation_id","manager_id","employment_type","employment_status","joining_date","work_location","emergency_contact_name","emergency_contact_phone","notes"];
export const list = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, offset } = pagination(req.query.page, req.query.limit);
  const search = String(req.query.search || "");
  const department = req.query.departmentId ? String(req.query.departmentId) : null;
  const status = req.query.status ? String(req.query.status) : null;
  const values = [`%${search}%`, department, status, limit, offset];
  const where = `WHERE ($1='' OR CONCAT_WS(' ',e.first_name,e.last_name,e.official_email,e.employee_code) ILIKE $1)
    AND ($2::uuid IS NULL OR e.department_id=$2) AND ($3::text IS NULL OR e.employment_status=$3)`;
  const [data, count] = await Promise.all([
    query(`SELECT e.*,d.name AS department_name,ds.name AS designation_name,CONCAT(m.first_name,' ',m.last_name) AS manager_name FROM employees e LEFT JOIN departments d ON d.id=e.department_id LEFT JOIN designations ds ON ds.id=e.designation_id LEFT JOIN employees m ON m.id=e.manager_id ${where} ORDER BY e.created_at DESC LIMIT $4 OFFSET $5`, values),
    query(`SELECT COUNT(*)::int AS total FROM employees e ${where}`, values.slice(0,3))
  ]);
  return ok(res, { items: data.rows, pagination: { page, limit, total: count.rows[0].total, pages: Math.ceil(count.rows[0].total/limit) } });
});
export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const result = await query(`SELECT e.*,d.name AS department_name,ds.name AS designation_name,CONCAT(m.first_name,' ',m.last_name) AS manager_name FROM employees e LEFT JOIN departments d ON d.id=e.department_id LEFT JOIN designations ds ON ds.id=e.designation_id LEFT JOIN employees m ON m.id=e.manager_id WHERE e.id=$1`, [req.params.id]);
  if (!result.rowCount) return fail(res, "Employee not found", 404);
  const reports = await query("SELECT id,employee_code,first_name,last_name,official_email,designation_id FROM employees WHERE manager_id=$1 ORDER BY first_name", [req.params.id]);
  return ok(res, { ...result.rows[0], directReports: reports.rows });
});
export const create = asyncHandler(async (req: Request, res: Response) => {
  const body = employeeSchema.parse(req.body);
  if (body.manager_id && body.manager_id === req.body.id) return fail(res, "An employee cannot report to themselves");
  const cols = fields.filter((f) => (body as any)[f] !== undefined);
  const vals = cols.map((f) => (body as any)[f]);
  const placeholders = cols.map((_,i) => `$${i+1}`);
  const result = await query(`INSERT INTO employees(${cols.join(",")}) VALUES(${placeholders.join(",")}) RETURNING *`, vals);
  return ok(res, result.rows[0], "Employee created", 201);
});
export const update = asyncHandler(async (req: Request, res: Response) => {
  const body = employeeSchema.partial().parse(req.body);
  if (!Object.keys(body).length) return fail(res, "No fields supplied");
  const cols = Object.keys(body).filter((f) => fields.includes(f));
  const vals = cols.map((f) => (body as any)[f]);
  const sets = cols.map((f,i) => `${f}=$${i+1}`);
  vals.push(req.params.id);
  const result = await query(`UPDATE employees SET ${sets.join(",")},updated_at=NOW() WHERE id=$${vals.length} RETURNING *`, vals);
  if (!result.rowCount) return fail(res, "Employee not found", 404);
  return ok(res, result.rows[0], "Employee updated");
});
export const remove = asyncHandler(async (req: Request, res: Response) => {
  const result = await query("DELETE FROM employees WHERE id=$1 RETURNING id", [req.params.id]);
  if (!result.rowCount) return fail(res, "Employee not found", 404);
  return ok(res, { id: req.params.id }, "Employee deleted");
});
export const orgTree = asyncHandler(async (_req: Request, res: Response) => {
  const result = await query(`SELECT e.id,e.employee_code,e.first_name,e.last_name,e.profile_image_url,e.manager_id,d.name AS department_name,ds.name AS designation_name FROM employees e LEFT JOIN departments d ON d.id=e.department_id LEFT JOIN designations ds ON ds.id=e.designation_id WHERE e.employment_status='ACTIVE' ORDER BY e.first_name`);
  const byId = new Map<string, any>();
  result.rows.forEach((r) => byId.set(r.id, { ...r, children: [] }));
  const roots: any[] = [];
  byId.forEach((node) => {
    const parent = node.manager_id ? byId.get(node.manager_id) : null;
    if (parent) parent.children.push(node); else roots.push(node);
  });
  return ok(res, roots);
});
export const uploadPhoto = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) return fail(res, "Please upload a valid image or PDF", 400);
  const url = `/uploads/${req.file.filename}`;
  const result = await query("UPDATE employees SET profile_image_url=$1,updated_at=NOW() WHERE id=$2 RETURNING id,profile_image_url", [url, req.params.id]);
  if (!result.rowCount) return fail(res, "Employee not found", 404);
  return ok(res, result.rows[0], "File uploaded");
});
