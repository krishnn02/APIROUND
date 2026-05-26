import { useState } from "react";
import TicketCard from "./TicketCard";

const API_URL = import.meta.env.VITE_API_URL;

const COLUMNS = [
  { status: "open", label: "Open" },
  { status: "in_progress", label: "In Progress" },
  { status: "resolved", label: "Resolved" },
  { status: "closed", label: "Closed" },
];

const ALLOWED_TRANSITIONS = {
  open: ["in_progress"],
  in_progress: ["open", "resolved"],
  resolved: ["in_progress", "closed"],
  closed: ["resolved"],
};

export default function Board({ tickets, onRefresh, showToast }) {
  const handleTransition = async (ticketId, newStatus) => {
    const res = await fetch(`${API_URL}/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Transition failed");
    }
    onRefresh();
  };

  const handleDelete = async (ticketId) => {
    const res = await fetch(`${API_URL}/tickets/${ticketId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Delete failed");
    }
    onRefresh();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");

    const ticketId = e.dataTransfer.getData("ticketId");
    const currentStatus = e.dataTransfer.getData("currentStatus");

    if (currentStatus === targetStatus) return;

    const allowed = ALLOWED_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(targetStatus)) {
      showToast(`Invalid move: ${currentStatus} → ${targetStatus}`);
      return;
    }

    try {
      await handleTransition(ticketId, targetStatus);
    } catch (err) {
      showToast(err.message);
    }
  };

  return (
    <div className="board" id="ticket-board">
      {COLUMNS.map((col) => {
        const columnTickets = tickets.filter((t) => t.status === col.status);
        return (
          <div
            key={col.status}
            className={`board-column column-${col.status}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.status)}
          >
            <div className="column-header">
              <h2>{col.label}</h2>
              <span className="column-count">{columnTickets.length}</span>
            </div>
            <div className="column-cards">
              {columnTickets.length === 0 ? (
                <div className="empty-column">
                  <div className="empty-icon">📂</div>
                  <div>No tickets</div>
                </div>
              ) : (
                columnTickets.map((ticket) => (
                  <div key={ticket._id}>
                    <TicketCard
                      ticket={ticket}
                      onTransition={handleTransition}
                      onDelete={handleDelete}
                      showToast={showToast}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
