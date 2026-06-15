# ✈️ AERO-FIX — Aviation Maintenance & Discrepancy Management System

Aero-Fix is a full-stack, role-based aviation software engineered to track aircraft technical health, log live discrepancies, and efficiently manage maintenance workflows. 

## 🌐 Live Preview
- **Frontend Deployment:** [(https://aircraft-maintenance-system-a6zv-e0jexjkbn.vercel.app/)]
- **Tech Stack:** React, TypeScript, Tailwind CSS, Express, Node.js, TypeORM, PostgreSQL.

---

## 🎭 System Roles & Real-Time Workflow

The ecosystem connects three distinct roles to ensure absolute aircraft safety before takeoff:

1. **🕵️‍♂️ Quality Checker / Tester**
   - Inspects active aircraft fleet status.
   - Instantly reports technical defects (Discrepancies) directly linked to specific aircraft IDs.
   - Automatically flags aircraft issues into the collective pool.

2. **🔧 Aircraft Maintenance Engineer (AME)**
   - Views a live pool of active technical problems reported by checkers.
   - Instantly claims tasks, works on repairs, and updates progress.
   - Marks discrepancies as `RESOLVED` once standard safety protocols are successfully cleared.

3. **👥 Admin Dashboard**
   - Monitors the entire fleet overview (Total Active Aircrafts, Serviceable vs AOG status).
   - Registers new aircraft into the system database.
   - Manually onboards and manages system access for verified Technical Personnel (Engineers and Checkers).

---

## 🚀 Key Features Built
- **Role-Based Routing:** Seamless redirection upon login (`/admin`, `/engineer`, `/checker`).
- **Dynamic Fleet Status Tracking:** Live visual state shifts when an aircraft goes under maintenance.
- **Secure Onboarding:** Admin-guarded api endpoints (`isAdmin` middleware) preventing unauthorized user creation.
- **Clean Architecture:** Fully typed data objects using **TypeScript** across both frontend and backend layers.
