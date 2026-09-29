import { PRIORITY_LABELS, STATUS_LABELS, TASK_STATUSES, Task, TaskStatus } from '../types';

interface TaskCardProps {
  task: Task;
  busy: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

function formatDueDate(value: string): string {
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) {
    return value;
  }
  return `${day}.${month}.${year}`;
}

function isOverdue(task: Task): boolean {
  if (!task.due_date || task.status === 'DONE') {
    return false;
  }

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return task.due_date < today;
}

export function TaskCard({ task, busy, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const overdue = isOverdue(task);

  return (
    <article className={`task-card priority-${task.priority.toLowerCase()}`}>
      <div className="task-card-top">
        <h3>{task.title}</h3>
        <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
          {PRIORITY_LABELS[task.priority]}
        </span>
      </div>

      {task.description && <p className="task-description">{task.description}</p>}

      <p className={`due-date ${overdue ? 'due-date-overdue' : ''}`}>
        {task.due_date ? `Due ${formatDueDate(task.due_date)}` : 'No due date'}
        {overdue ? ' · Overdue' : ''}
      </p>

      <div className="status-controls" role="group" aria-label="Change status">
        {TASK_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            className={`status-button ${task.status === status ? 'status-button-active' : ''}`}
            disabled={busy || task.status === status}
            onClick={() => onStatusChange(task, status)}
          >
            {STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      <div className="card-actions">
        <button type="button" className="button button-secondary" disabled={busy} onClick={() => onEdit(task)}>
          Edit
        </button>
        <button type="button" className="button button-danger" disabled={busy} onClick={() => onDelete(task)}>
          {busy ? 'Working...' : 'Delete'}
        </button>
      </div>
    </article>
  );
}
