# DeskFlow — Support Ticket Triage Board

A full-stack MERN application for managing support tickets with SLA tracking, status transitions, and a drag-and-drop Kanban board.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Frontend:** React (Vite), Vanilla CSS

## Project Structure

```
├── backend/          # Express API server
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API route handlers
│   ├── utils/        # Helper functions (SLA logic)
│   └── server.js     # Entry point
└── frontend/         # React SPA
    └── src/
        └── components/  # UI components
```

## Setup

### Backend

```bash
cd backend
cp .env.example .env   # Edit with your MongoDB URI
npm install
npm start
```

### Frontend

```bash
cd frontend
cp .env.example .env   # Edit API URL if needed
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint             | Description                  |
|--------|----------------------|------------------------------|
| POST   | /api/tickets         | Create a new ticket          |
| GET    | /api/tickets         | List tickets (with filters)  |
| PATCH  | /api/tickets/:id     | Update ticket status         |
| DELETE | /api/tickets/:id     | Delete a ticket              |
| GET    | /api/tickets/stats   | Get ticket statistics        |

## Features

- **Kanban Board** with 4 status columns (Open, In Progress, Resolved, Closed)
- **Drag & Drop** tickets between columns (HTML5 API)
- **SLA Tracking** with breach indicators per priority level
- **Status Transitions** enforced (forward + one-step backward only)
- **Filters** by priority and SLA breach status
- **Real-time Stats** strip showing counts and breached tickets
- **Form Validation** with inline field-level errors
- **Responsive Design** with dark mode and glassmorphism UI
