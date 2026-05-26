import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const STAT_ITEMS = [
  { key: "open", label: "Open", path: "byStatus" },
  { key: "in_progress", label: "In Progress", path: "byStatus" },
  { key: "resolved", label: "Resolved", path: "byStatus" },
  { key: "closed", label: "Closed", path: "byStatus" },
  { key: "breached", label: "SLA Breached", path: "slaBreachedOpen" },
];

export default function StatsStrip({ refreshKey }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/tickets/stats`);
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="stats-strip">
        {STAT_ITEMS.map((item) => (
          <div key={item.key} className={`stat-card ${item.key}`}>
            <div className="stat-label">{item.label}</div>
            <div className="stat-value">—</div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="stats-strip" id="stats-strip">
      {STAT_ITEMS.map((item) => {
        const value =
          item.path === "slaBreachedOpen"
            ? stats.slaBreachedOpen
            : stats.byStatus[item.key];
        return (
          <div key={item.key} className={`stat-card ${item.key}`}>
            <div className="stat-label">{item.label}</div>
            <div className="stat-value">{value ?? 0}</div>
          </div>
        );
      })}
    </div>
  );
}
