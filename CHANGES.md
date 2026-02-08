# CRM Demo – Summary of Changes

## 1. Changes Made

### Task 1 – Stabilize system
- **Backend entry:** Added root `index.js` that loads `server/index.ts` via `node --import tsx index.js`. Backend runs with `npm run server` or `node --import tsx index.js` (no `dist` required for dev).
- **Package scripts (Windows-friendly):**
  - `dev` → `vite` (frontend only, typically port 5173)
  - `server` → `node --import tsx index.js` (API on port 5000)
  - `start` → `node --import tsx index.js`
  - Removed `db:push` (Drizzle).
- **Database:** Replaced PostgreSQL + Drizzle with **MongoDB + Mongoose**. Connection: `mongodb://127.0.0.1:27017/crm-demo`. Removed `pg`, `drizzle-orm`, `drizzle-zod`, `connect-pg-simple`, `passport`, `passport-local`, `express-session`, `memorystore` from dependencies.
- **CORS:** Enabled for any `localhost` / `127.0.0.1` origin so Vite (e.g. 5173, 5174) can call the API.
- **API base URL:** Frontend uses `http://localhost:5000` via `client/src/lib/api.ts` and `apiUrl()` in all hooks.
- **Static serve:** In production, static files are served from `dist/public` (no Vite in backend; frontend and backend are separate in dev).
- **Replit:** Removed Replit/cloud DB logic; no `DATABASE_URL`; build allowlist updated for mongoose (no pg/drizzle).

### Task 2 – Role-based login (demo only)
- **Auth API:** `POST /api/auth/login` with hardcoded users (admin, salesman, tech, manager, customer / password). Returns `{ user: { username, role } }`. No JWT or hashing.
- **Login page:** `client/src/pages/Login.tsx` – form, error state, demo hint.
- **Auth context:** `client/src/contexts/AuthContext.tsx` – login/logout, role and user stored in `localStorage` (`crm_role`, `crm_user`).
- **Route protection:** All app routes except `/login` are wrapped in `ProtectedRoute`; unauthenticated users are redirected to `/login`.
- **Sidebar:** Shows current user and role; Logout clears storage and redirects to `/login`.

### Task 3 – Full CRM modules
- **Customers:** CRUD, contact info, segment (New/Repeat/VIP), reminder flag, notes. Schema supports warranty (warrantyExpiry in model). Purchase history derived from orders.
- **Products:** CRUD, stock, low-stock filter (UI checkbox), supplier field.
- **Sales & billing:** Create order (customer + items), auto stock deduction, payment status. Invoice: `GET /api/orders/:id/invoice` and Invoice dialog on Orders page.
- **Repairs:** CRUD, device/serial/IMEI, technician notes/assignment, status pipeline: Received → Diagnosing → In Repair → Completed → Delivered. Kanban columns and form updated to these statuses.
- **Leads:** New module – CRUD, callback requested, product interest, convert lead to customer (`POST /api/leads/:id/convert`). New page `Leads.tsx` and hooks `use-leads.ts`, `use-appointments.ts`.
- **Appointments:** List, create, delete; New Appointment dialog (customer name, date, time, purpose).
- **Dashboard:** Stats include totalRevenue, monthlyRevenue, activeRepairs, totalCustomers, totalProducts, lowStockProducts, **newLeads**. New Leads stat card; Recharts kept for revenue/repair charts.

### Task 4 – Module integration
- Order creation reduces product stock and updates dashboard (orders + products refetched).
- Lead convert creates a customer and marks lead as Converted; customers list invalidated.
- All data in one MongoDB database `crm-demo`.

### Task 5 – UI/UX
- Sidebar layout, responsive tables, modals/forms, loading skeletons, empty states, error toasts.
- Low-stock filter (Products), search (Customers, Leads, Products, Repairs).
- Consistent layout and typography; invoice dialog on Orders.

### Task 6 – Code quality
- Backend: Mongoose models in `server/models/`, single `storage` layer in `server/storage.ts`, routes in `server/routes.ts`.
- Frontend: Shared hooks with `apiUrl()`, reusable Layout/Sidebar, no duplicate API logic.
- Removed Drizzle/pg; shared schema is Zod-only for API validation and types.

---

## 2. New API Routes

| Method | Path | Description |
|--------|------|-------------|
| POST   | /api/auth/login | Demo login (username, password) → { user: { username, role } } |
| GET    | /api/customers | List (optional ?search=) |
| GET    | /api/customers/:id | Get one |
| POST   | /api/customers | Create |
| PUT    | /api/customers/:id | Update |
| DELETE | /api/customers/:id | Delete |
| GET    | /api/products | List (?search=, ?lowStock=true) |
| GET    | /api/products/:id | Get one |
| POST   | /api/products | Create |
| PUT    | /api/products/:id | Update |
| DELETE | /api/products/:id | Delete |
| GET    | /api/repairs | List (?search=, ?status=) |
| GET    | /api/repairs/:id | Get one |
| POST   | /api/repairs | Create |
| PUT    | /api/repairs/:id | Update |
| DELETE | /api/repairs/:id | Delete |
| GET    | /api/leads | List |
| GET    | /api/leads/:id | Get one |
| POST   | /api/leads | Create |
| PUT    | /api/leads/:id | Update |
| POST   | /api/leads/:id/convert | Convert lead to customer |
| GET    | /api/appointments | List |
| POST   | /api/appointments | Create |
| DELETE | /api/appointments/:id | Delete |
| GET    | /api/orders | List |
| GET    | /api/orders/:id/invoice | Get order with customer and line items (invoice) |
| POST   | /api/orders | Create (customerId, items[], paymentStatus?) |
| GET    | /api/dashboard/stats | Stats (totalCustomers, totalProducts, lowStockProducts, activeRepairs, totalRevenue, monthlyRevenue, newLeads) |

---

## 3. MongoDB Models (Mongoose)

All in `server/models/`, database `crm-demo`:

- **Customer** – name, phone, email, notes, segment, warrantyExpiry, reminderFlag, timestamps.
- **Product** – name, category, price, stock, supplier, timestamps.
- **Repair** – deviceName, serialNumber, imei, issueDescription, status, technicianNotes, technicianId, amount, customerId (ref), notesHistory[], timestamps.
- **Appointment** – customerName, date, time, purpose, staffId, timestamps.
- **Order** – customerId (ref), total, paymentStatus, items[{ productId (ref), quantity }], timestamps.
- **Lead** – name, email, phone, interest, status, callbackRequested, notes, timestamps.

---

## 4. New UI Pages / Major Updates

- **Login** – `client/src/pages/Login.tsx` (new).
- **Leads** – `client/src/pages/Leads.tsx` (new): list, search, create/edit lead, convert to customer.
- **Dashboard** – New Leads stat card; 5 stat cards; existing Recharts.
- **Customers** – Segment and reminder flag in form.
- **Products** – Supplier field, “Low stock only” filter.
- **Repairs** – Status pipeline (Received → … → Delivered), Kanban columns aligned to statuses.
- **Orders** – Invoice button and Invoice dialog (order + customer + items).
- **Appointments** – New Appointment dialog, delete, loading/empty states.

---

## 5. Exact Local Run Steps

1. **Install:**  
   `cd Customer-Realm-Manager` → `npm install`

2. **MongoDB:**  
   Ensure MongoDB is running on `127.0.0.1:27017`.

3. **Backend:**  
   `npm run server`  
   (or `node --import tsx index.js`)  
   → API at **http://localhost:5000**, seed on first run if DB empty.

4. **Frontend:**  
   In another terminal: `npm run dev`  
   → App at **http://localhost:5173** (or next port, e.g. 5174).

5. **Login:**  
   Use e.g. `admin` / `password` (or salesman, tech, manager, customer / password).

See **RUN.md** for more detail and troubleshooting.
