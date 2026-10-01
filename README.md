# HRMS ERP — Human Resource Management System

A full-stack, enterprise-grade Employee Management System built with a modern tech stack, featuring role-based access control, real-time dashboards, and complete HR workflow automation.

🔗 **Live Demo:** https://human-resource-1-5fje.onrender.com
🔗 **Backend API:** https://human-resource-lnps.onrender.com

---

## ✨ Features

- **Authentication** — JWT-based login, forgot/reset password via email
- **Role-Based Access Control** — Admin, HR, Manager, and Employee each see a tailored experience
- **Employee Management** — CRUD, search/filter, pagination, profile photo upload
- **Department & Designation Management** — with department-head auto-assignment
- **Attendance** — check-in/check-out, working-hours calculation, monthly reports
- **Leave Management** — apply, approve/reject, leave balance tracking
- **Payroll** — salary structure, monthly payroll generation, payslips
- **Performance Reviews** — ratings, feedback, goal tracking
- **Role-specific Dashboards** — Admin (company-wide analytics), Manager (team view), Employee (personal view)
- **Notifications**

## 🛠️ Tech Stack

**Backend:** Node.js, Express, TypeScript, MySQL (mysql2), JWT, bcrypt, Zod
**Frontend:** React, TypeScript, Vite, Redux Toolkit, React Query, Tailwind CSS, Framer Motion, Recharts
**Infrastructure:** Aiven (MySQL), Render (backend + static frontend hosting)

## 🏗️ Architecture

Backend follows a clean layered architecture:

13-table normalized MySQL schema with proper foreign keys, constraints, and indexing.

## 🚀 Local Setup

### Backend
```bash
cd backend
cp .env.example .env   # fill in DB + SMTP + JWT secrets
npm install
# run src/database/schema.sql against your MySQL instance
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📂 Project Structure
├── backend/
│ ├── src/
│ │ ├── config/ # DB, env, upload config
│ │ ├── controllers/ # request/response handlers
│ │ ├── services/ # business logic
│ │ ├── models/ # SQL queries
│ │ ├── routes/
│ │ ├── middleware/ # auth, RBAC, validation
│ │ └── database/ # schema.sql
│ └── Dockerfile
└── frontend/
└── src/
├── api/ # axios + per-module API functions
├── pages/ # route-level pages per module
├── components/ # reusable UI (Toast, ConfirmDialog, Skeletons)
├── features/auth/ # Redux auth slice
└── app/ # Redux store

## 👤 Roles

| Role | Access |
|---|---|
| **Admin** | Full system access |
| **HR** | Employee, department, payroll, leave management |
| **Manager** | Team view, leave approvals for direct reports |
| **Employee** | Self-service: attendance, leave, payslips, reviews |

---

Built as a portfolio project demonstrating production-grade full-stack architecture, security practices, and deployment.