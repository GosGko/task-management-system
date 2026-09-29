import { StatusFilter, TASK_STATUSES, STATUS_LABELS } from '../types';

interface FilterBarProps {
  search: string;
  status: StatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onCreate: () => void;
  createDisabled: boolean;
}

export function FilterBar({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onCreate,
  createDisabled,
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      <label className="field grow">
        <span>Search by title</span>
        <input
          type="search"
          value={search}
          placeholder="Find a task"
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>

      <label className="field">
        <span>Status</span>
        <select value={status} onChange={(event) => onStatusChange(event.target.value as StatusFilter)}>
          <option value="ALL">All</option>
          {TASK_STATUSES.map((item) => (
            <option key={item} value={item}>
              {STATUS_LABELS[item]}
            </option>
          ))}
        </select>
      </label>

      <button type="button" className="button button-primary" onClick={onCreate} disabled={createDisabled}>
        New task
      </button>
    </div>
  );
}
