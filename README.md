# 🎯 DeskFlow — Support Ticket Triage Board

![DeskFlow Banner](https://via.placeholder.com/1200x400/1a1a2e/e8e8f0?text=DeskFlow+-+Support+Ticket+Triage)

> A modern, full-stack MERN application for managing support tickets with intelligent SLA tracking, status transitions, and a drag-and-drop Kanban interface.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

---

## 🚀 Live Demo

- **Frontend Application:** [DeskFlow Vercel App](https://apiround-three.vercel.app/)
- **Backend API:** [DeskFlow Render API](https://deskflow-backend-ghbm.onrender.com)

---

## ✨ Key Features

- **Interactive Kanban Board**: 4-column layout (Open, In Progress, Resolved, Closed) using native HTML5 Drag and Drop API.
- **Intelligent SLA Tracking**: Dynamic, read-time calculation of ticket age and SLA breaches based on priority targets (Urgent: 1h, High: 4h, Medium: 24h, Low: 72h).
- **Strict State Machine**: Enforced forward and one-step backward status transitions via REST API with inline error prevention and global toast notifications.
- **Real-time Filtering**: Combinable filters for Priority and SLA Breach status, seamlessly integrated into the UI.
- **Glassmorphism UI**: Beautiful dark-mode aesthetic with custom animations, glowing badges, and responsive mobile swipe layouts (No UI libraries used).

---

## 📂 Architecture & Project Structure

The project is structured as a monorepo containing two decoupled applications:

```text
├── backend/                  # Node.js + Express API Server
│   ├── models/Ticket.js      # Mongoose schema with strict validation
│   ├── routes/tickets.js     # RESTful endpoints (GET, POST, PATCH, DELETE)
│   ├── utils/helpers.js      # DRY SLA calculation logic
│   ├── .env.example          # Environment variables template
│   └── server.js             # Express app entry & MongoDB connection
│
├── frontend/                 # React SPA bundled with Vite
│   ├── src/
│   │   ├── components/       # Modular React components (Board, TicketCard, etc.)
│   │   ├── App.jsx           # Main application layout & state management
│   │   ├── index.css         # Complete custom CSS design system
│   │   └── main.jsx          # React DOM entry
│   └── .env.example          # Frontend environment config
│
├── render.yaml               # Infrastructure-as-Code for Render backend deployment
└── frontend/vercel.json      # Client-side routing configuration for Vercel
```

---

## 🛠️ Installation & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/APIROUND.git
cd APIROUND
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env and insert your MongoDB Atlas URI
npm install
npm start
```
_The API will run on `http://localhost:5000`_

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
cp .env.example .env
# Ensure VITE_API_URL is set to http://localhost:5000/api
npm install
npm run dev
```
_The UI will be available at `http://localhost:5173`_

---

## 🌐 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/tickets` | Create a new support ticket |
| `GET` | `/api/tickets` | Fetch all tickets. Supports `?status`, `?priority`, and `?breached` query filters. |
| `PATCH` | `/api/tickets/:id` | Update ticket status (Enforces transition rules) |
| `DELETE`| `/api/tickets/:id` | Permanently delete a ticket |
| `GET` | `/api/tickets/stats`| Retrieve aggregate metrics for the Stats Strip |

---

## 💡 Engineering Decisions & Trade-offs
1. **Dynamic SLA Calculation**: Instead of running a cron job to continually update the database, SLA breaches and `ageMinutes` are computed dynamically at *read-time* in `utils/helpers.js`. This reduces database write operations drastically.
2. **Vanilla CSS**: Opted out of Tailwind or Material UI to demonstrate raw CSS architectural skills (CSS Variables, Flexbox/Grid, Animations, Scroll Snapping).
3. **State Management**: Context/Redux was avoided in favor of lifted state in `App.jsx` and prop-drilling, which perfectly fits the scope of a single-page dashboard while avoiding boilerplate.
4. **Transition Enforcement**: The backend acts as a strict state machine, preventing illegal ticket movements (e.g., Open directly to Closed), ensuring data integrity.

---
_Designed and Developed for Full-Stack Engineering Assessment._
