# CRM Backend – Render Deployment Notes

## Runtime
- Entry: `index.js`
- Start command: `npm start`

## Required Environment Variables

```env
MONGO_URI=mongodb+srv://applecrmdemo_db_user:ireallydontknow@cluster0.eiailbv.mongodb.net/applestorecrm
PORT=5000
```

## Local Backend Start

```bash
npm install
MONGO_URI="mongodb+srv://applecrmdemo_db_user:ireallydontknow@cluster0.eiailbv.mongodb.net/applestorecrm" npm start
```

Server binds to:
- `const PORT = process.env.PORT || 5000`
- `app.listen(PORT, ...)` via `httpServer.listen(PORT, "0.0.0.0", ...)`

## Render
This repo includes `render.yaml` configured for a **backend-only** web service:
- No frontend build step required.
- No static frontend serving required.
- Backend API boot is independent of `dist/public`.
