<h1 align="center">🔗 LinkUp — Real-Time Chat & Video Calling</h1>

<p align="center">A full-stack MERN application for discovering people, building connections, real-time messaging, and one-to-one video calling.</p>

## Highlights

- 🔐 JWT authentication with HTTP-only cookies and protected routes
- 👤 User onboarding with profiles, languages, location, and avatars
- 🤝 Friend discovery, connection requests, accept/reject workflows
- 💬 Real-time one-to-one messaging powered by Stream Chat
- 📞 One-to-one video calling powered by Stream Video
- 🔗 Shareable video-call links directly from a conversation
- ⚡ TanStack Query for server-state management and cache invalidation
- 🎨 30+ DaisyUI themes with persistent theme selection
- 📱 Responsive React UI for desktop and mobile layouts
- 🛡️ Validated API inputs, protected endpoints, safe auth cookies, and centralized error handling
- 🩺 Health-check endpoint and graceful backend shutdown

## Architecture

```text
React + Tailwind + DaisyUI
        │
        ├── TanStack Query / Axios
        │
        ▼
Express REST API ─── JWT Cookie Authentication
        │
        ├── MongoDB / Mongoose
        │
        └── Stream Chat + Stream Video
```

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS + DaisyUI
- TanStack Query
- Zustand
- Stream Chat React SDK
- Stream Video React SDK
- React Router

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT + HTTP-only cookies
- Stream Chat SDK
- CORS / Cookie Parser

## Project Structure

```text
LinkUp/
├── backend/
│   └── src/
│       ├── controllers/
│       ├── lib/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── server.js
├── frontend/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       ├── pages/
│       ├── store/
│       └── App.jsx
└── README.md
```

## Environment Setup

### Backend — `backend/.env`

```env
PORT=5001
MONGO_URI=your_mongo_uri
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
JWT_SECRET_KEY=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:5001/api
VITE_STREAM_API_KEY=your_stream_api_key
```

## Run Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on the Vite development server and the API runs on port `5001` by default.

## Health Check

```text
GET /api/health
```

Example response:

```json
{
  "status": "ok",
  "service": "linkup-api",
  "environment": "development",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

## Core API Routes

### Authentication
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/onboarding`

### Users & Connections
- `GET /api/users`
- `GET /api/users/friends`
- `POST /api/users/friend-request/:id`
- `PUT /api/users/friend-request/:id/accept`
- `PUT /api/users/friend-request/:id/reject`
- `GET /api/users/friend-requests`
- `GET /api/users/outgoing-friend-requests`

### Chat
- `GET /api/chat/token`

## Production Notes

- Keep `JWT_SECRET_KEY` long and random.
- Set `FRONTEND_URL` to the deployed frontend origin.
- Never commit `.env` files or Stream credentials.
- The backend serves the built frontend when `NODE_ENV=production`.
