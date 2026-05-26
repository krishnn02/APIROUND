import { useState } from "react";

const TRANSITIONS = {
  open: { forward: "in_progress", backward: null },
  in_progress: { forward: "resolved", backward: "open" },
  resolved: { forward: "closed", backward: "in_progress" },
  closed: { forward: null, backward: "resolved" },
};

const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

function formatAge(ageMinutes) {
  const hours = Math.floor(ageMinutes / 60);
  const mins = ageMinutes % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default function TicketCard({
  ticket,
  onTransition,
  onDelete,
  showToast,
}) {
  const [loading, setLoading] = useState(false);

  const transitions = TRANSITIONS[ticket.status];

  const handleTransition = async (newStatus) => {
    setLoading(true);
    try {
      await onTransition(ticket._id, newStatus);
    } catch (err) {
      showToast(err.message || "Transition failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(ticket._id);
    } catch (err) {
      showToast(err.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData("ticketId", ticket._id);
    e.dataTransfer.setData("currentStatus", ticket.status);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("dragging");
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove("dragging");
  };

  return (
    <div
      className="ticket-card"
      id={`ticket-${ticket._id}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <button
        className="card-delete-btn"
        onClick={handleDelete}
        disabled={loading}
        title="Delete ticket"
        aria-label="Delete ticket"
      >
        ✕
      </button>

      <div className="card-subject">{ticket.subject}</div>
      <div className="card-email">{ticket.customerEmail}</div>

      <div className="card-meta">
        <span className={`priority-badge ${ticket.priority}`}>
          {ticket.priority}
        </span>
        <span className="card-age">⏱ {formatAge(ticket.ageMinutes)}</span>
        {ticket.slaBreached && (
          <span className="sla-breached-label">⚠ SLA Breached</span>
        )}
      </div>

      <div className="card-actions">
        {transitions.backward && (
          <button
            className="btn-backward"
            onClick={() => handleTransition(transitions.backward)}
            disabled={loading}
            title={`Move back to ${STATUS_LABELS[transitions.backward]}`}
          >
            ←
          </button>
        )}
        {transitions.forward && (
          <button
            onClick={() => handleTransition(transitions.forward)}
            disabled={loading}
            title={`Move to ${STATUS_LABELS[transitions.forward]}`}
          >
            →
          </button>
        )}
      </div>
    </div>
  );
}
