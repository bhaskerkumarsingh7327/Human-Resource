# HRMS ERP — Phase 1 Scaffold

Enterprise-style HR Management module. Phase 1 covers: project setup, database schema,
authentication, and role-based access control (RBAC).

## Stack (Phase 1 delivered)
- Node.js + Express + TypeScript
- MySQL (mysql2, raw SQL, normalized schema)
- JWT auth (access + refresh tokens)
- bcrypt password hashing
- Zod input validation
- Centralized error handling
- helmet + cors + rate limiting

## Folder Structure
```
backend/
  src/
    config/       # env loader, DB pool
    database/     # schema.sql
    models/       # raw SQL query functions per table
    middleware/   # auth, RBAC, validation, error handler
    validators/   # zod schemas
    services/     # business logic
    controllers/  # request/response glue
    routes/       # route definitions
    utils/        # jwt, AppError, response helpers, asyncHandler
    types/        # shared TS types
    app.ts        # express app config
    server.ts     # entrypoint
```

## Setup Steps

### 1. Prerequisites
- Node.js 18+
- MySQL 8+ running locally (or Docker)

### 2. Create the database
```bash
mysql -u root -p < backend/src/database/schema.sql
```
This creates the `hrms_erp` database with all tables, foreign keys, and indexes,
and seeds the 4 roles (ADMIN, HR, MANAGER, EMPLOYEE).

### 3. Configure environment
```bash
cd backend
cp .env.example .env
# edit .env: set DB_PASSWORD, JWT secrets, etc.
```

### 4. Install & run
```bash
npm install
npm run dev
```
Server starts at `http://localhost:5000`. Check `GET /health`.

### 5. Test the auth flow
```bash
# Register (creates a user + linked employee record in one transaction)
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@company.com",
    "password":"SuperSecure123",
    "role":"ADMIN",
    "firstName":"System",
    "lastName":"Admin",
    "dateOfJoining":"2026-01-01"
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"SuperSecure123"}'

# Use returned accessToken:
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

## RBAC pattern (used from Phase 2 onward)
```ts
router.post(
  '/employees',
  authenticate,
  authorize('ADMIN', 'HR'),
  employeeController.create
);
```

## Roadmap
- **Phase 1 (this scaffold):** Project setup, DB schema, Auth, RBAC ✅
- **Phase 2:** Employee, Department, Designation modules (CRUD + search/filter + photo upload)
- **Phase 3:** Attendance (check-in/out, working hours calc) + Leave management (balances, approvals)
- **Phase 4:** Payroll (salary structure, payslip generation) + Performance reviews
- **Phase 5:** Analytics dashboard, notifications, tests, Docker

## Next step
Tell me "Phase 2 start karo" and I'll build the Employee + Department + Designation
modules (models, services, controllers, routes) on top of this exact same pattern —
plus we can start the React + TypeScript + Redux Toolkit + React Query frontend
(login page, protected routes, dashboard shell) in parallel.
