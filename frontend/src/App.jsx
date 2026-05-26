import { useState, useEffect, useCallback } from "react";
import StatsStrip from "./components/StatsStrip";
import FilterBar from "./components/FilterBar";
import Board from "./components/Board";
import CreateTicketModal from "./components/CreateTicketModal";
import "./index.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [priorityFilter, setPriorityFilter] = useState("");
  const [breachedOnly, setBreachedOnly] = useState(false);

  const [toast, setToast] = useState(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (priorityFilter) params.append("priority", priorityFilter);
      if (breachedOnly) params.append("breached", "true");

      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`${API_URL}/tickets${query}`);

      if (!res.ok) throw new Error("Failed to fetch tickets");

      const data = await res.json();
      setTickets(data);
    } catch (err) {
      setError(err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [priorityFilter, breachedOnly]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleRefresh = () => {
    fetchTickets();
    setRefreshKey((k) => k + 1);
  };

  const handleTicketCreated = () => {
    showToast("Ticket created successfully", "success");
    handleRefresh();
  };

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          DeskFlow
          <span>Support Ticket Triage</span>
        </h1>
        <button
          className="btn-new-ticket"
          onClick={() => setShowModal(true)}
          id="btn-new-ticket"
        >
          + New Ticket
        </button>
      </header>

      <StatsStrip refreshKey={refreshKey} />

      <FilterBar
        priority={priorityFilter}
        onPriorityChange={setPriorityFilter}
        breachedOnly={breachedOnly}
        onBreachedChange={setBreachedOnly}
      />

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <div className="loading-text">Loading tickets...</div>
        </div>
      ) : (
        <Board
          tickets={tickets}
          onRefresh={handleRefresh}
          showToast={showToast}
        />
      )}

      {showModal && (
        <CreateTicketModal
          onClose={() => setShowModal(false)}
          onCreated={handleTicketCreated}
        />
      )}

      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === "error" ? "⚠" : "✓"} {toast.message}
        </div>
      )}
    </div>
  );
}
