import { FormEvent, useState } from 'react';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TITLE_MAX_LENGTH,
  Task,
  TaskInput,
  TaskPriority,
  TaskStatus,
} from '../types';

interface TaskFormProps {
  mode: 'create' | 'edit';
  initialTask: Task | null;
  submitting: boolean;
  error: string | null;
  onSubmit: (input: TaskInput) => void;
  onCancel: () => void;
}

function toInput(task: Task | null): TaskInput {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: task?.status ?? 'TODO',
    priority: task?.priority ?? 'MEDIUM',
    due_date: task?.due_date ?? '',
  };
}

export function TaskForm({ mode, initialTask, submitting, error, onSubmit, onCancel }: TaskFormProps) {
  const [form, setForm] = useState<TaskInput>(() => toInput(initialTask));
  const [localError, setLocalError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const title = form.title.trim();

    if (!title) {
      setLocalError('Title is required.');
      return;
    }

    if (title.length > TITLE_MAX_LENGTH) {
      setLocalError(`Title must be at most ${TITLE_MAX_LENGTH} characters.`);
      return;
    }

    setLocalError(null);
    onSubmit({
      title,
      description: form.description?.trim() ? form.description.trim() : null,
      status: form.status,
      priority: form.priority,
      due_date: form.due_date || null,
    });
  }

  const message = localError || error;

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <h2>{mode === 'create' ? 'Create task' : 'Edit task'}</h2>
        <button type="button" className="button button-ghost" onClick={onCancel} disabled={submitting}>
          Close
        </button>
      </div>

      {message && <p className="form-error">{message}</p>}

      <label className="field">
        <span>Title</span>
        <input
          type="text"
          value={form.title}
          maxLength={TITLE_MAX_LENGTH}
          required
          onChange={(event) => setForm({ ...form, title: event.target.value })}
        />
      </label>

      <label className="field">
        <span>Description</span>
        <textarea
          value={form.description ?? ''}
          rows={3}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
        />
      </label>

      <div className="form-row">
        <label className="field">
          <span>Status</span>
          <select
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value as TaskStatus })}
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Priority</span>
          <select
            value={form.priority}
            onChange={(event) => setForm({ ...form, priority: event.target.value as TaskPriority })}
          >
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Due date</span>
          <input
            type="date"
            value={form.due_date ?? ''}
            onChange={(event) => setForm({ ...form, due_date: event.target.value })}
          />
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="button button-primary" disabled={submitting}>
          {submitting ? 'Saving...' : mode === 'create' ? 'Create task' : 'Save changes'}
        </button>
        <button type="button" className="button button-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}
