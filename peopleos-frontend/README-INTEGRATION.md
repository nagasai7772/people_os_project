# PeopleOS Frontend – Backend Integration Fix

This frontend connects to the PeopleOS Express API and Neon PostgreSQL through the backend.

## What was fixed
- Backend roles (`ADMIN`, `MANAGER`, `EMPLOYEE`) are normalized to the lowercase frontend role values.
- Protected routes now wait for session restoration instead of redirecting while auth state is loading.
- Existing sessions are restored through `GET /api/auth/me`.
- Access tokens are attached to API requests.
- Expired access tokens are refreshed through `POST /api/auth/refresh` and the original request is retried.
- The Dashboard route now renders a real dashboard instead of the generic "coming soon" page.
- Dashboard stats, recent employees, and department distribution are loaded from the backend API.
- API errors and empty states are displayed instead of leaving a blank content area.

## Setup
1. Ensure the backend is running on `http://localhost:5000`.
2. Copy `.env.example` to `.env`.
3. Set `VITE_API_URL=http://localhost:5000/api` in `.env`.
4. Run `npm install` (do not copy `node_modules` from the ZIP).
5. Run `npm run dev`.
6. Clear the old PeopleOS browser session if needed: DevTools → Application → Local Storage and Session Storage → remove `peopleos.session`, then log in again.

## Demo login accounts
- `admin@peopleos.com` / `Admin@123`
- `manager@peopleos.com` / `Manager@123`
- `employee@peopleos.com` / `Employee@123`

These are only convenience values shown by the login form. The backend database remains the source of truth.

## API routes used by the Dashboard
- `GET /api/auth/me`
- `GET /api/reports/dashboard`
- `GET /api/employees?limit=6&page=1`
- `GET /api/departments`

## Current scope
The Dashboard is connected to live APIs. The other navigation modules were still implemented as `ModulePendingPage` in the uploaded source ZIP and remain marked as coming soon; they have not been falsely represented as fully implemented. They can be integrated one by one after the dashboard is verified.

## Security
Do not commit `.env` or expose JWTs. If a real access or refresh token was pasted into a chat, rotate the backend JWT secrets and sign in again.
