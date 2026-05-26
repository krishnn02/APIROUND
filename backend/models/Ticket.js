const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, "Subject is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
  },
  customerEmail: {
    type: String,
    required: [true, "Customer email is required"],
    trim: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Please provide a valid email address",
    ],
  },
  priority: {
    type: String,
    required: [true, "Priority is required"],
    enum: {
      values: ["low", "medium", "high", "urgent"],
      message: "Priority must be one of: low, medium, high, urgent",
    },
  },
  status: {
    type: String,
    enum: {
      values: ["open", "in_progress", "resolved", "closed"],
      message: "Status must be one of: open, in_progress, resolved, closed",
    },
    default: "open",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("Ticket", ticketSchema);
