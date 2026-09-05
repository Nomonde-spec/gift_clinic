# Public Clinic Queue & Stock Tracker

A production-grade, secure, full-stack healthcare web application designed to eliminate wasted travel and painful queues at public health clinics by delivering real-time visibility into waiting times, triage status, and essential medication availability.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Core Features](#core-features)
4. [User Roles & Demo Credentials](#user-roles--demo-credentials)
5. [Technology Stack](#technology-stack)
6. [System Architecture](#system-architecture)
7. [Database Design & ERD](#database-design--erd)
8. [Local Development Setup](#local-development-setup)
9. [Environment Variables](#environment-variables)
10. [Database Migrations & Seeding](#database-migrations--seeding)
11. [REST API Documentation](#rest-api-documentation)
12. [Security & RBAC Model](#security--rbac-model)
13. [Automated Testing](#automated-testing)
14. [Cloud Deployment Guide](#cloud-deployment-guide)
    - [Frontend on Vercel](#frontend-on-vercel)
    - [Backend on Render](#backend-on-render)
    - [Database on Neon PostgreSQL](#database-on-neon-postgresql)
15. [Troubleshooting Guide](#troubleshooting-guide)

---

## 1. Project Overview

Visiting public health facilities is frequently plagued by uncertainty: patients commute long distances only to find overcrowded waiting rooms, hours of waiting time, or unavailable essential medicines (such as antibiotics, insulin, or hypertension medication).

The **Public Clinic Queue & Stock Tracker** provides a centralized, transparent platform where:
- **Patients** can search clinics by location or waiting time, view live queue counts and estimated wait minutes, and verify medication stock before traveling.
- **Healthcare Staff** can adjust triage queue metrics in real-time, increment/decrement drug quantities, and monitor low-stock thresholds.
- **Health Administrators** can manage facility profiles, assign staff to specific clinics, regulate the national medication catalogue, review compliance audit logs, and analyze queue trends.

---

## 2. Problem Statement

Public clinic patients face:
- **Wasted travel and expenses**: Traveling to a clinic only to discover a required medication is out of stock.
- **Extreme waiting times**: Arriving during unexpected peak triage surges without advance knowledge.
- **Poor distribution across facilities**: Primary clinics being overwhelmed while nearby community clinics remain under-utilized.

This application acts as a logistical bridge between healthcare facilities and the communities they serve.

---

## 3. Core Features

### 🔍 Clinic Discovery & Smart Filtering
- Live search by clinic name, suburb, city, or street address.
- Dynamic filtering by **Open Facilities**, **Queue Severity** (Low, Moderate, Busy, Very Busy), and **Stock Availability**.
- Sorting by **Shortest Wait Time**, **Longest Wait Time**, or **Clinic Name (A-Z)**.

### ⏱ Real-Time Queue & Waiting Room Monitoring
- Live triage count: Patients waiting, estimated wait time in minutes, and active consultation rooms.
- Color-coded severity indicators:
  - 🟢 **LOW**: < 30 minutes wait
  - 🔵 **MODERATE**: 30 – 60 minutes wait
  - 🟠 **BUSY**: 60 – 120 minutes wait
  - 🔴 **VERY BUSY**: > 120 minutes wait (triggers automated warning notifications)
  - ⚪ **CLOSED**: Intake closed
- Historical queue load graphs over 24 hours, 7 days, and 30 days.

### 💊 Pharmacy Stock & Automated Alerts
- Real-time stock status calculations computed automatically from drug quantity and low-stock threshold:
  $$\text{quantity} = 0 \implies \text{OUT\_OF\_STOCK}$$
  $$0 < \text{quantity} \le \text{threshold} \implies \text{LOW\_STOCK}$$
  $$\text{quantity} > \text{threshold} \implies \text{IN\_STOCK}$$
- In-app notification bell with badge counter alerting staff when drugs drop to low or zero stock.
- Stepper controls `[-] [quantity] [+]` and direct numeric editing with non-negative validation.

### 📊 System Intelligence & Analytics
- Comprehensive reports showing busiest clinics, peak waiting hours, and recurring drug shortage patterns.
- Comparative clinic benchmark matrix comparing wait times, queue sizes, and pharmacy availability rates.

### 🛡 Immutable Compliance Audit Trail
- Every queue update, stock adjustment, user login, and administrative action is recorded with actor ID, action type, entity, timestamp, and IP address.

---

## 4. User Roles & Demo Credentials

The database seeder provisions demo accounts for each role:

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Patient** | `patient@gmail.com` | `PatientPass123!` | Public discovery, clinic details, live queues, stock lookup, notifications, profile. |
| **Staff (Soweto)** | `staff@soweto.clinic.gov.za` | `StaffPass123!` | Assigned to **Soweto Community Clinic**. Can update Soweto queue & stock, view history. |
| **Staff (Hillbrow)** | `staff@hillbrow.clinic.gov.za` | `StaffPass123!` | Assigned to **Hillbrow Community Health Centre**. Can update Hillbrow queue & stock. |
| **Administrator** | `admin@clinic.gov.za` | `AdminPass123!` | Global administrative access to all clinics, staff accounts, medication catalogue, reports, and audit logs. |

> *Note: On the `/login` page, you can click the quick autofill buttons to immediately sign in as Patient, Staff, or Admin.*

---

## 5. Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Library**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Design System**: Accessible modern healthcare UI (Teal / Blue / Slate)
- **Icons**: Lucide React
- **Data Visualizations**: Recharts (Responsive Area & Bar Charts)
- **Theme**: Light & Dark mode support

### Backend
- **Runtime**: Node.js v20+ / Express.js
- **Language**: TypeScript
- **ORM**: Prisma ORM 5.x
- **Database**: PostgreSQL (Neon Serverless PostgreSQL compatible)
- **Authentication**: JWT (`jsonwebtoken`) + `bcryptjs` password hashing (salt rounds: 10)
- **Validation**: Zod schema validation
- **Testing**: Jest + Supertest

---

## 6. System Architecture

```
                    PATIENT / STAFF / ADMIN
                              │
                              ▼
                       VERCEL HOSTING
                   Next.js 14 (App Router)
                              │
                              │ REST API over HTTPS
                              ▼
                       RENDER HOSTING
               Node.js + Express + TypeScript
               ├── Auth & RBAC Middleware
               ├── Zod Input Validation
               └── Business Domain Services
                              │
                              ▼
                         PRISMA ORM
                              │
                              ▼
                     NEON POSTGRESQL
              (Serverless Relational DB)
```

---

## 7. Database Design & ERD

The relational schema consists of 10 structured entities:

1. **User**: System identity, hashed passwords, role (`PATIENT`, `STAFF`, `ADMIN`), active status.
2. **Clinic**: Facility details, address, coordinates, opening/closing schedule, `isOpen`.
3. **StaffClinic**: Many-to-many relationship enforcing clinic tenancy for staff members.
4. **ClinicOperatingHours**: Weekly schedule (Monday–Sunday) with opening/closing hours.
5. **Medication**: National catalogue with category, dispensing unit, and `lowStockThreshold`.
6. **ClinicMedicationStock**: Per-clinic inventory with quantity, status (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`), and last updater.
7. **QueueStatus**: 1-to-1 live queue snapshot per clinic.
8. **QueueHistory**: Time-series log of queue waiting counts and estimated minutes.
9. **StockHistory**: Time-series log of quantity and status transitions.
10. **Notification**: User-targeted alerts for low stock, queue warnings, and system announcements.
11. **AuditLog**: Immutable compliance trail capturing all critical actions.

---

## 8. Local Development Setup

### Prerequisites
- Node.js v18.0.0 or higher
- npm v9.0.0 or higher
- Git

### 1. Clone the repository
```bash
git clone <repo-url>
cd "clinic system"
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Edit `backend/.env` with your PostgreSQL database URL.

Generate Prisma client:
```bash
npx prisma generate
```

If your database is available, sync the schema and seed the demo data:
```bash
npm run prisma:push
npm run prisma:seed
```

Start the backend API server without forcing a DB sync on every boot:
```bash
npm run dev
```
The API server will listen on `http://localhost:5000`. Test healthcheck at `http://localhost:5000/api/health`.

> If your Neon database is temporarily unavailable, the server still starts, but schema sync should be run separately with `npm run prisma:push` once the database is reachable again.

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
cp .env.example .env.local
```
Verify `frontend/.env.local` contains:
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

Start the Next.js development server:
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 9. Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="clinic-system-super-secret-jwt-key-2025-production-grade"
JWT_EXPIRES_IN="24h"
FRONTEND_URL="http://localhost:3000"
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

---

## 10. Database Migrations & Seeding

```bash
# Push schema updates directly (development)
npx prisma db push

# Generate Prisma migrations (production workflow)
npx prisma migrate dev --name init

# Generate Prisma TypeScript client
npx prisma generate

# Execute seed script (creates Soweto, Hillbrow, demo users, medications, queue history)
npm run prisma:seed
```

---

## 11. REST API Documentation

All responses conform to the standard JSON envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable feedback"
}
```

### Authentication
- `POST /api/auth/register` — Patient registration (`name`, `surname`, `email`, `password`, `phone`).
- `POST /api/auth/login` — Login (`email`, `password`). Returns JWT access token & user profile.
- `POST /api/auth/logout` — Invalidate session and log audit record.
- `GET /api/auth/me` — Current user profile with assigned clinic affiliations.
- `PUT /api/auth/profile` — Update user details or change password.

### Clinics
- `GET /api/clinics` — List clinics with search (`query`, `city`, `suburb`), filters (`isOpen`, `queueStatus`), and sorting (`waitAsc`, `nameAsc`).
- `GET /api/clinics/:id` — Full clinic details with current queue and medication stock summary.
- `POST /api/clinics` — Create clinic *(Admin only)*.
- `PUT /api/clinics/:id` — Update clinic details *(Admin only)*.
- `PATCH /api/clinics/:id/toggle` — Toggle clinic Open/Closed status *(Admin only)*.

### Queue Management
- `GET /api/clinics/:id/queue` — Current live queue status.
- `PUT /api/clinics/:id/queue` — Update waiting patients, wait minutes, and consultation rooms *(Assigned Staff or Admin)*.
- `GET /api/clinics/:id/queue/history` — Historical queue records.
- `GET /api/clinics/:id/queue/analytics` — Current wait, average wait today, peak wait, and peak hours.

### Medication Catalogue & Stock
- `GET /api/medications` — All medications in national catalogue.
- `POST /api/medications` — Add medication *(Admin only)*.
- `PUT /api/medications/:id` — Edit medication details & threshold *(Admin only)*.
- `PATCH /api/medications/:id/toggle` — Toggle active status *(Admin only)*.
- `GET /api/clinics/:id/stock` — Clinic pharmacy inventory with real-time status.
- `PUT /api/clinics/:id/stock/:medicationId` — Adjust stock quantity *(Assigned Staff or Admin)*.
- `GET /api/clinics/:id/stock/history` — Stock change audit history.

### Notifications
- `GET /api/notifications` — User notifications and unread badge count.
- `PATCH /api/notifications/:id/read` — Mark notification as read.
- `PATCH /api/notifications/read-all` — Mark all notifications as read.

### System Intelligence & Admin
- `GET /api/admin/dashboard` — System KPIs and recent audit stream.
- `GET /api/admin/staff` — List staff with assigned clinics.
- `POST /api/admin/staff` — Provision new staff account and bind clinics.
- `PATCH /api/admin/staff/:id/toggle` — Enable / disable staff account.
- `GET /api/admin/audit-logs` — Immutable audit log feed.
- `GET /api/reports/queue` — Queue duration distribution and busiest facility metrics.
- `GET /api/reports/stock` — Inventory availability rate and shortage analysis.
- `GET /api/reports/clinics` — Multi-clinic performance benchmark matrix.

---

## 12. Security & RBAC Model

1. **Role-Based Authorization Matrix**:
   - `PATIENT`: Read-only access to clinic queues, stock levels, and search.
   - `STAFF`: Tenancy-restricted access. Can **only** modify queues and stocks for clinics assigned in the `StaffClinic` table. Attempts to modify other clinics are rejected with `403 Forbidden`.
   - `ADMIN`: Full system management without access to private patient data.
2. **Password Security**:
   - All passwords hashed using `bcryptjs` with salt cost 10.
3. **Input Validation**:
   - Zod validation rejects negative quantities, negative wait times, invalid emails, and weak passwords at the network edge (`422 Unprocessable Entity`).
4. **CORS & Headers**:
   - Restricted origin whitelist preventing cross-site request abuse.

---

## 13. Automated Testing

Run the automated backend test suite:
```bash
cd backend
npm test
```

Test coverage includes:
- System Healthcheck endpoint (`GET /api/health`)
- Password hashing and verification
- JWT signing and decoding
- Validation rejection for invalid emails and short passwords
- RBAC guards blocking unauthorized access to Admin endpoints
- Tenancy validation preventing cross-clinic staff updates
- Unit verification of stock status transitions (0 $\to$ `OUT_OF_STOCK`, $\le$ threshold $\to$ `LOW_STOCK`, $>$ threshold $\to$ `IN_STOCK`)

---

## 14. Cloud Deployment Guide

### Database on Neon PostgreSQL
1. Create a free PostgreSQL project at [neon.tech](https://neon.tech).
2. Copy the connection string:
   `postgresql://neondb_owner:[PASSWORD]@[HOST].neon.tech/neondb?sslmode=require`
3. Set this as `DATABASE_URL` in Render and local environments.

### Backend on Render
1. Create a new **Web Service** on [render.com](https://render.com) connected to your repository.
2. Root Directory: `backend`
3. Environment: `Node`
4. Build Command: `npm install && npx prisma generate && npm run build`
5. Start Command: `npm run start`
6. Configure Environment Variables:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: *Your Neon connection string*
   - `JWT_SECRET`: *A secure 32+ character key*
   - `JWT_EXPIRES_IN`: `24h`
   - `FRONTEND_URL`: *Your deployed Vercel domain (e.g. `https://clinic-tracker.vercel.app`)*
7. Verify Healthcheck: `https://[your-render-app].onrender.com/api/health`

### Frontend on Vercel
1. Import project into [vercel.com](https://vercel.com).
2. Root Directory: `frontend`
3. Framework Preset: `Next.js`
4. Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://[your-render-app].onrender.com/api`
5. Deploy.

---

## 15. Troubleshooting Guide

Follow this 10-step diagnostic workflow when troubleshooting issues:

1. **Read the complete error message**: Note the HTTP status code and response payload.
2. **Identify the failing layer**: Frontend UI component, API Network request, Backend Express controller, or Prisma ORM.
3. **Check Frontend Network tab**: Ensure requests target `NEXT_PUBLIC_API_URL` without trailing slash discrepancies.
4. **Check Backend Console Logs**: Inspect structured error messages output by `errorHandler`.
5. **Verify Environment Variables**: Ensure `DATABASE_URL`, `JWT_SECRET`, and `FRONTEND_URL` are defined and correctly populated.
6. **Check Database Connection**: Test whether Neon PostgreSQL is reachable over port 5432 with SSL enabled (`sslmode=require`).
7. **Verify Prisma Client**: Ensure `npx prisma generate` was executed following any `schema.prisma` edits.
8. **Check CORS Headers**: Verify the backend allows the exact origin of the calling frontend.
9. **Verify RBAC Permissions**: Confirm the bearer token belongs to the correct role (`ADMIN` or assigned `STAFF`).
10. **Retest**: Run `npm test` inside `backend/` to ensure all core integration tests pass.
