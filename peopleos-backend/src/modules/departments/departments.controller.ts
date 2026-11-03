import { Request, Response } from "express";
import { z } from "zod";
import { query } from "../../database/pool";
import { ok, fail } from "../../utils/http";
import { asyncHandler } from "../../utils/asyncHandler";
const schema = z.object({ name:z.string().min(2), code:z.string().min(2), description:z.string().optional().nullable(), head_employee_id:z.string().uuid().optional().nullable(), parent_department_id:z.string().uuid().optional().nullable(), status:z.enum(["ACTIVE","INACTIVE"]).optional() });
export const list = asyncHandler(async (_req:Request,res:Response)=> {
 const r=await query(`SELECT d.*,COUNT(e.id)::int AS employee_count,CONCAT(h.first_name,' ',h.last_name) AS head_name FROM departments d LEFT JOIN employees e ON e.department_id=d.id LEFT JOIN employees h ON h.id=d.head_employee_id GROUP BY d.id,h.first_name,h.last_name ORDER BY d.name`);
 return ok(res,r.rows);
});
export const getOne = asyncHandler(async(req:Request,res:Response)=>{
 const r=await query("SELECT * FROM departments WHERE id=$1",[req.params.id]); if(!r.rowCount)return fail(res,"Department not found",404);
 const employees=await query("SELECT id,employee_code,first_name,last_name,official_email FROM employees WHERE department_id=$1 ORDER BY first_name",[req.params.id]);
 return ok(res,{...r.rows[0],employees:employees.rows});
});
export const create = asyncHandler(async(req:Request,res:Response)=>{const b=schema.parse(req.body);const r=await query("INSERT INTO departments(name,code,description,head_employee_id,parent_department_id,status) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",[b.name,b.code,b.description||null,b.head_employee_id||null,b.parent_department_id||null,b.status||"ACTIVE"]);return ok(res,r.rows[0],"Department created",201);});
export const update = asyncHandler(async(req:Request,res:Response)=>{const b=schema.partial().parse(req.body);const keys=Object.keys(b);if(!keys.length)return fail(res,"No fields supplied");const vals=keys.map(k=>(b as any)[k]);const set=keys.map((k,i)=>`${k}=$${i+1}`);vals.push(req.params.id);const r=await query(`UPDATE departments SET ${set.join(",")},updated_at=NOW() WHERE id=$${vals.length} RETURNING *`,vals);if(!r.rowCount)return fail(res,"Department not found",404);return ok(res,r.rows[0],"Department updated");});
export const remove = asyncHandler(async(req:Request,res:Response)=>{const r=await query("DELETE FROM departments WHERE id=$1 RETURNING id",[req.params.id]);if(!r.rowCount)return fail(res,"Department not found",404);return ok(res,r.rows[0],"Department deleted");});
