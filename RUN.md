# CRM Demo – Local Run Instructions

## Prerequisites

- **Node.js** (v18+)
- **MongoDB** running locally on default port `27017`
- **Windows** (CMD or PowerShell)

## 1. Install dependencies

```powershell
cd Customer-Realm-Manager
npm install
copy .env.example .env
```

## 2. Start MongoDB

Ensure MongoDB is running locally:

- Default URI: `mongodb://127.0.0.1:27017`
- Database used: `crm-demo` (created automatically)

## 3. Start the backend (API)

```powershell
npm run server
```

Or:

```powershell
node --import tsx index.js
```

- API base: **http://localhost:5000**
- Routes: **http://localhost:5000/api/...**
- On first run, seed data is inserted if the DB is empty.

## 4. Start the frontend (separate terminal)

```powershell
npm run dev
```

- App: **http://localhost:5173** (or next free port, e.g. 5174)
- Uses API at `http://localhost:5000` (see `client/src/lib/api.ts`)

## 5. Log in (demo credentials)

| Username  | Password  | Role        |
|-----------|-----------|-------------|
| admin     | password  | Admin       |
| salesman  | password  | Sales       |
| tech      | password  | Technician  |
| manager   | password  | Manager     |
| customer  | password  | Customer    |

## 6. Production build (optional)

```powershell
npm run build
```

Then run the server (serves API + built client):

```powershell
npm run start
```

Static files are served from `dist/public` when `NODE_ENV=production`.

## Environment variables

| Variable      | Default                          | Description           |
|---------------|-----------------------------------|-----------------------|
| PORT          | 5000                              | Backend port          |
| MONGODB_URI   | (required)                        | MongoDB connection string (`mongodb://` or `mongodb+srv://`) |
| CORS_ORIGIN   | (any localhost origin)            | Allowed frontend origin |
| NODE_ENV      | development                       | development/production |

## Troubleshooting

- **"Failed to fetch" in browser:** Backend must be running on port 5000; frontend uses `http://localhost:5000` for API.
- **MongoDB connection error:** Start MongoDB locally and confirm nothing else is using port 27017.
- **Port in use:** Change `PORT` for the backend or use another port for Vite (it will try 5174, etc., if 5173 is busy).
