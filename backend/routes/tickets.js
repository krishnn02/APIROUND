const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");
const { computeDerivedFields, isSlaBreached } = require("../utils/helpers");

const ALLOWED_TRANSITIONS = {
  open: ["in_progress"],
  in_progress: ["open", "resolved"],
  resolved: ["in_progress", "closed"],
  closed: ["resolved"],
};

function validateTicketFields(body) {
  const errors = [];
  if (!body.subject || !body.subject.trim()) {
    errors.push({ field: "subject", message: "Subject is required" });
  }
  if (!body.description || !body.description.trim()) {
    errors.push({ field: "description", message: "Description is required" });
  }
  if (!body.customerEmail || !body.customerEmail.trim()) {
    errors.push({
      field: "customerEmail",
      message: "Customer email is required",
    });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customerEmail)) {
    errors.push({
      field: "customerEmail",
      message: "Please provide a valid email address",
    });
  }
  if (!body.priority) {
    errors.push({ field: "priority", message: "Priority is required" });
  } else if (!["low", "medium", "high", "urgent"].includes(body.priority)) {
    errors.push({
      field: "priority",
      message: "Priority must be one of: low, medium, high, urgent",
    });
  }
  return errors;
}

// GET /api/tickets/stats — must be defined BEFORE /:id
router.get("/stats", async (req, res) => {
  try {
    const tickets = await Ticket.find();

    const byStatus = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    const byPriority = { low: 0, medium: 0, high: 0, urgent: 0 };
    let slaBreachedOpen = 0;

    tickets.forEach((ticket) => {
      byStatus[ticket.status] = (byStatus[ticket.status] || 0) + 1;
      byPriority[ticket.priority] = (byPriority[ticket.priority] || 0) + 1;

      if (
        (ticket.status === "open" || ticket.status === "in_progress") &&
        isSlaBreached(ticket)
      ) {
        slaBreachedOpen++;
      }
    });

    res.json({ byStatus, byPriority, slaBreachedOpen });
  } catch (err) {
    res.status(500).json({ error: "Server error fetching stats" });
  }
});

// POST /api/tickets
router.post("/", async (req, res) => {
  try {
    const errors = validateTicketFields(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const ticket = new Ticket({
      subject: req.body.subject.trim(),
      description: req.body.description.trim(),
      customerEmail: req.body.customerEmail.trim().toLowerCase(),
      priority: req.body.priority,
    });

    const saved = await ticket.save();
    res.status(201).json(computeDerivedFields(saved));
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return res.status(400).json({ errors });
    }
    res.status(500).json({ error: "Server error creating ticket" });
  }
});

// GET /api/tickets
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
    let results = tickets.map((t) => computeDerivedFields(t));

    if (req.query.breached === "true") {
      results = results.filter((t) => t.slaBreached === true);
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Server error fetching tickets" });
  }
});

// PATCH /api/tickets/:id
router.patch("/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const { status: newStatus } = req.body;
    if (!newStatus) {
      return res.status(400).json({ error: "Status is required" });
    }

    const allowed = ALLOWED_TRANSITIONS[ticket.status];
    if (!allowed || !allowed.includes(newStatus)) {
      return res.status(400).json({
        error: `Invalid transition: ${ticket.status} → ${newStatus}`,
      });
    }

    // Auto-set resolvedAt when transitioning TO resolved
    if (newStatus === "resolved") {
      ticket.resolvedAt = new Date();
    }

    // Clear resolvedAt when transitioning FROM resolved (backward)
    if (ticket.status === "resolved" && newStatus !== "closed") {
      ticket.resolvedAt = null;
    }

    ticket.status = newStatus;
    const saved = await ticket.save();
    res.json(computeDerivedFields(saved));
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(404).json({ error: "Ticket not found" });
    }
    res.status(500).json({ error: "Server error updating ticket" });
  }
});

// DELETE /api/tickets/:id
router.delete("/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    res.json({ message: "Deleted" });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(404).json({ error: "Ticket not found" });
    }
    res.status(500).json({ error: "Server error deleting ticket" });
  }
});

module.exports = router;
