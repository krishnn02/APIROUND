export default function FilterBar({
  priority,
  onPriorityChange,
  breachedOnly,
  onBreachedChange,
}) {
  return (
    <div className="filter-bar" id="filter-bar">
      <label htmlFor="priority-filter">Priority:</label>
      <select
        id="priority-filter"
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value)}
      >
        <option value="">All</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>

      <label className="filter-checkbox">
        <input
          type="checkbox"
          id="breached-filter"
          checked={breachedOnly}
          onChange={(e) => onBreachedChange(e.target.checked)}
        />
        <span>Show only SLA breached</span>
      </label>
    </div>
  );
}
