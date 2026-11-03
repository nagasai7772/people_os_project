# PeopleOS API endpoint map

Base URL: `/api`

## Authentication
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout` (authenticated)
- `GET /auth/me` (authenticated)

## Employees
- `GET /employees`
- `GET /employees/:id`
- `POST /employees` (Admin, Manager)
- `PATCH /employees/:id` (Admin, Manager)
- `DELETE /employees/:id` (Admin)
- `GET /employees/org-chart`
- `POST /employees/:id/photo` (authenticated)

List query parameters: `page`, `limit`, `search`, `departmentId`, `status`.

## Departments
- `GET /departments`
- `GET /departments/:id`
- `POST /departments` (Admin)
- `PATCH /departments/:id` (Admin)
- `DELETE /departments/:id` (Admin)

## Designations
- `GET /designations`
- `POST /designations` (Admin)
- `PATCH /designations/:id` (Admin)
- `DELETE /designations/:id` (Admin)

## Performance
- `GET /performance`
- `GET /performance/:id`
- `POST /performance` (Admin, Manager)
- `PATCH /performance/:id` (Admin, Manager)

## Users
- `GET /users` (Admin)
- `POST /users` (Admin)
- `PATCH /users/:id/status` (Admin)

## Notifications
- `GET /notifications`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`

## Reports
- `GET /reports/dashboard`
- `GET /reports/employees-by-department` (Admin, Manager)
- `GET /reports/employees` (Admin, Manager; optional `departmentId`, `status`)

## Settings
- `GET /settings`
- `PUT /settings` (Admin)

## System
- `GET /health`
- `GET /docs`
