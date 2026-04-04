# The Bespoke Atelier

A full-stack barbershop booking application. Clients can browse services, view the team, and book appointments online. Admins manage appointments and clients through a protected dashboard.

## Tech Stack

**Client** — React 18, Vite, React Router v6, TanStack Query, React Hook Form, date-fns, CSS Modules

**Server** — Node.js, Express, MongoDB (Mongoose), JWT authentication (access token in-memory + refresh token via httpOnly cookie)

**Hosting** — Vercel (client + server as separate projects)

---

## Project Structure

```
theBespokeAtelier/
├── client/          # Vite + React frontend
└── server/          # Express REST API
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB instance (local or Atlas)

### Server

```bash
cd server
cp .env.example .env   # fill in the variables below
npm install
npm run seed           # seed admin, barbers, services, and sample data
npm run dev
```

**Required environment variables (`server/.env`):**

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
PORT=5000
```

### Client

```bash
cd client
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173` and proxies `/api` requests to `http://localhost:5000`.

---

## Admin Access

After running the seed script, log in at `/login`:

```
Email:    admin@bespokeatelier.com
Password: Admin1234!
```

Change the password after first login.

---

## Deployment (Vercel)

### Server

1. Create a new Vercel project pointed at the `server/` directory.
2. Set environment variables in Vercel:
   ```
   MONGODB_URI
   JWT_SECRET
   JWT_REFRESH_SECRET
   CLIENT_URL   ← your deployed client URL
   NODE_ENV=production
   ```

### Client

1. Create a new Vercel project pointed at the `client/` directory. Framework preset: **Vite**.
2. In `client/vercel.json` the `/api/*` rewrite is already configured to proxy to the server — update the destination URL if your server domain differs.
3. No environment variables needed on the client.

---

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | Admin login |
| POST | `/api/auth/refresh` | cookie | Refresh access token |
| POST | `/api/auth/logout` | cookie | Logout |
| GET | `/api/services` | — | List services (filter by `?category=`) |
| GET | `/api/barbers` | — | List barbers |
| GET | `/api/appointments/available-slots` | — | Available time slots |
| POST | `/api/appointments` | — | Create booking |
| GET | `/api/appointments` | admin | List all appointments |
| PATCH | `/api/appointments/:id/status` | admin | Update appointment status |
| DELETE | `/api/appointments/:id` | admin | Delete appointment |
| GET | `/api/appointments/stats` | admin | Dashboard stats |
| GET | `/api/clients` | admin | List clients |
