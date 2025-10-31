# QuickPoll - Real-Time Polling Platform

A real-time polling platform where you can create polls, vote, and see live updates as others participate - no signup required!

## Features

- ✅ Live updates for votes and likes via WebSockets
- ✅ Anonymous polling with browser session tracking
- ✅ Create polls with 2-10 multiple options
- ✅ Submit votes and change votes
- ✅ Like/unlike polls
- ✅ Real-time updates reflected across all users
- ✅ Responsive design for all devices

## System Design & Architecture

**Frontend**: Next.js 14 with App Router, TanStack Query for state management, Socket.io-client for real-time updates, shadcn/ui for components.

**Backend**: Node.js + Express REST API, Socket.io for WebSocket server, MySQL database with Drizzle ORM, Session-based authentication without login.

**Real-time Updates**: WebSocket rooms per poll for broadcasting vote/like changes to all connected clients instantly.

**Deployment**: Backend on Render (free tier), Frontend on Vercel, Database (MySQL) on Render or PlanetScale.

## Tech Stack

**Backend:**
- Node.js with Express
- Socket.io for real-time updates
- MySQL with Drizzle ORM
- UUID-based anonymous sessions

**Frontend:**
- Next.js 14
- TanStack Query + Zustand
- Tailwind CSS + shadcn/ui
- Socket.io-client

## Quick Start

### Backend

```bash
cd poll-backend
npm install
cp env.example .env
```

Update `.env` with your database credentials:

```env
DATABASE_URL=mysql://username:password@host:port/database
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Run migrations and start the server:

```bash
npm run migrate:push
npm run dev
```

### Frontend

```bash
cd poll-frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:8080
```

Start the dev server:

```bash
npm run dev
```

## Deployment

### Live URLs

- **Frontend**: [https://quick-poll-dev.vercel.app/](https://quick-poll-dev.vercel.app/)
- **Backend**: [https://poll-backend-py4a.onrender.com/](https://poll-backend-py4a.onrender.com/)

**Hosting**: Frontend on Vercel, Backend on Render, Database on Render MySQL

### Environment Variables

**Backend (Render):**
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=mysql://...
FRONTEND_URL=https://quick-poll-dev.vercel.app
```

**Frontend (Vercel):**
```env
NEXT_PUBLIC_API_URL=https://poll-backend-py4a.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://poll-backend-py4a.onrender.com
```

Verify deployment with:
```bash
./verify-deployment.sh https://poll-backend-py4a.onrender.com https://quick-poll-dev.vercel.app
```

## API Endpoints

**Public:**
- `GET /api/polls` - List all polls with pagination
- `GET /api/polls/:id` - Get poll details by ID
- `GET /health` - Health check endpoint
- `GET /api/test-db` - Test database connection

**Session-based:**
- `POST /api/polls` - Create new poll (requires 2-10 options)
- `PUT /api/polls/:id` - Update poll (creator only)
- `DELETE /api/polls/:id` - Delete poll (creator only)
- `POST /api/polls/:id/vote` - Vote on poll option
- `DELETE /api/polls/:id/vote` - Remove your vote
- `POST /api/polls/:id/like` - Like poll
- `DELETE /api/polls/:id/like` - Unlike poll
- `GET /api/session/polls` - Get polls created by your session
- `GET /api/session/votes` - Get your voting history

**WebSocket Events:**
- `join_poll` / `leave_poll` - Subscribe/unsubscribe to poll updates
- `poll_updated` - Poll metadata changed
- `vote_added` / `vote_changed` / `vote_removed` - Vote count updates
- `like_added` / `like_removed` - Like count updates
- `poll_deleted` - Poll was deleted

## Development

**Backend:**
```bash
npm run dev          # Development server
npm run build        # Build
npm run migrate      # Generate migrations
npm run migrate:push # Apply migrations
```

**Frontend:**
```bash
npm run dev    # Development server
npm run build  # Build
npm run lint   # Lint code
```

## License

MIT
