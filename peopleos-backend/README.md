# PeopleOS Backend

A modular Node.js + Express + TypeScript backend for the PeopleOS Employee & Organization Management System.

**This version intentionally uses PostgreSQL with the `pg` driver and parameterized SQL. It does not use Prisma, an ORM, or Docker.**

## Requirements
- Node.js 20+
- PostgreSQL 14+
- npm

## 1. Install dependencies
```bash
npm install
```

## 2. Create database
Create a PostgreSQL database named `peopleos`, for example:
```sql
CREATE DATABASE peopleos;
```

## 3. Configure environment
Copy `.env.example` to `.env` and update `DATABASE_URL` and both JWT secrets. Use long, random secrets in any shared or deployed environment.

## 4. Create tables
Run the SQL in `src/database/schema.sql` against the `peopleos` database. You can use pgAdmin, DBeaver, or psql.

Example:
```bash
psql "postgresql://postgres:password@localhost:5432/peopleos" -f src/database/schema.sql
```

## 5. Seed demo data
```bash
npm run seed
```

Demo accounts:
| Role | Email | Password |
|---|---|---|
| Admin | admin@peopleos.com | Admin@123 |
| Manager | manager@peopleos.com | Manager@123 |
| Employee | employee@peopleos.com | Employee@123 |

Change these demo passwords before using any non-local environment.

## 6. Start server
```bash
npm run dev
```
API: `http://localhost:5000/api`
Health: `http://localhost:5000/api/health`
Swagger UI: `http://localhost:5000/api/docs`

## Available route groups
- `/api/auth`
- `/api/employees`
- `/api/departments`
- `/api/designations`
- `/api/performance`
- `/api/users`
- `/api/notifications`
- `/api/reports`
- `/api/settings`

## Authentication
Send the access token on protected routes:
```http
Authorization: Bearer <accessToken>
```
Login with `POST /api/auth/login` and send `{ "email": "...", "password": "..." }`.
Refresh with `POST /api/auth/refresh` and send `{ "refreshToken": "..." }`.
Logout with `POST /api/auth/logout` and send the refresh token in the body.

## Example: create employee
`POST /api/employees`
```json
{
  "employee_code": "EMP011",
  "first_name": "Nisha",
  "last_name": "Kapoor",
  "official_email": "nisha@peopleos.com",
  "department_id": "UUID_FROM_DEPARTMENTS",
  "designation_id": "UUID_FROM_DESIGNATIONS",
  "employment_type": "FULL_TIME",
  "employment_status": "ACTIVE",
  "joining_date": "2025-01-15"
}
```

## Frontend integration
Set `CLIENT_ORIGIN` to your frontend origin. The API uses JSON request/response bodies. Successful responses use:
```json
{ "success": true, "message": "Success", "data": {} }
```
Errors use:
```json
{ "success": false, "message": "Error description" }
```

## Important implementation notes
- SQL queries use PostgreSQL positional parameters (`$1`, `$2`, ...) to avoid SQL injection for values.
- Do not interpolate user-controlled values into SQL identifiers. The current update handlers only accept allow-listed fields from validated schemas.
- The included role middleware is a baseline. Before production, add record-level authorization (for example, enforce that managers can only access their own department and reporting tree).
- Review the upload policy, storage strategy, malware scanning, and access controls before accepting real employee documents.
- Configure HTTPS, secure secret management, backups, monitoring, retention policies, and stricter rate limits before production deployment.
- The demo seed is designed for local development, not production.
- Run `npm run typecheck` and test all workflows before connecting a live frontend.
