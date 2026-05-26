import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function CreateTicketModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    subject: "",
    description: "",
    customerEmail: "",
    priority: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const errs = {};
    if (!form.subject.trim()) errs.subject = "Subject is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.customerEmail.trim()) {
      errs.customerEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) {
      errs.customerEmail = "Please enter a valid email";
    }
    if (!form.priority) errs.priority = "Priority is required";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          const fieldErrors = {};
          data.errors.forEach((err) => {
            fieldErrors[err.field] = err.message;
          });
          setErrors(fieldErrors);
        } else {
          setApiError(data.error || "Failed to create ticket");
        }
        return;
      }

      onCreated(data);
      onClose();
    } catch {
      setApiError("Network error — could not reach server");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      id="create-ticket-modal"
    >
      <div className="modal-content">
        <h2>Create New Ticket</h2>

        {apiError && <div className="error-banner">{apiError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className={errors.subject ? "error" : ""}
              placeholder="Brief summary of the issue"
            />
            {errors.subject && (
              <div className="field-error">{errors.subject}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              className={errors.description ? "error" : ""}
              placeholder="Describe the issue in detail"
            />
            {errors.description && (
              <div className="field-error">{errors.description}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="customerEmail">Customer Email</label>
            <input
              type="email"
              id="customerEmail"
              name="customerEmail"
              value={form.customerEmail}
              onChange={handleChange}
              className={errors.customerEmail ? "error" : ""}
              placeholder="customer@example.com"
            />
            {errors.customerEmail && (
              <div className="field-error">{errors.customerEmail}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className={errors.priority ? "error" : ""}
            >
              <option value="">Select priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            {errors.priority && (
              <div className="field-error">{errors.priority}</div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
