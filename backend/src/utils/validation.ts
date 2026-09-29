import {
  CreateTaskInput,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TITLE_MAX_LENGTH,
  TaskPriority,
  TaskStatus,
  UpdateTaskInput,
} from '../types/task';

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  value?: CreateTaskInput | UpdateTaskInput;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidStatus(value: unknown): value is TaskStatus {
  return typeof value === 'string' && TASK_STATUSES.includes(value as TaskStatus);
}

function isValidPriority(value: unknown): value is TaskPriority {
  return typeof value === 'string' && TASK_PRIORITIES.includes(value as TaskPriority);
}

function isValidDate(value: unknown): boolean {
  if (value === null || value === undefined || value === '') {
    return true;
  }
  if (typeof value !== 'string') {
    return false;
  }
  // Accept YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function normalizeOptionalText(value: unknown): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function normalizeDueDate(value: unknown): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null || value === '') {
    return null;
  }
  if (typeof value === 'string') {
    return value;
  }
  return undefined;
}

export function validateCreateTask(body: unknown): ValidationResult {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { ok: false, errors: ['Request body must be a JSON object.'] };
  }

  const data = body as Record<string, unknown>;

  if (!isNonEmptyString(data.title)) {
    errors.push('title is required and must be a non-empty string.');
  } else if (data.title.trim().length > TITLE_MAX_LENGTH) {
    errors.push(`title must be at most ${TITLE_MAX_LENGTH} characters.`);
  }

  if (data.status !== undefined && !isValidStatus(data.status)) {
    errors.push(`status must be one of: ${TASK_STATUSES.join(', ')}.`);
  }

  if (data.priority !== undefined && !isValidPriority(data.priority)) {
    errors.push(`priority must be one of: ${TASK_PRIORITIES.join(', ')}.`);
  }

  if (data.description !== undefined && data.description !== null && typeof data.description !== 'string') {
    errors.push('description must be a string or null.');
  }

  if (!isValidDate(data.due_date)) {
    errors.push('due_date must be a valid date in YYYY-MM-DD format, null, or omitted.');
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const value: CreateTaskInput = {
    title: (data.title as string).trim(),
    description: normalizeOptionalText(data.description) ?? null,
    status: isValidStatus(data.status) ? data.status : 'TODO',
    priority: isValidPriority(data.priority) ? data.priority : 'MEDIUM',
    due_date: normalizeDueDate(data.due_date) ?? null,
  };

  return { ok: true, errors: [], value };
}

export function validateUpdateTask(body: unknown): ValidationResult {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { ok: false, errors: ['Request body must be a JSON object.'] };
  }

  const data = body as Record<string, unknown>;
  const allowedKeys = ['title', 'description', 'status', 'priority', 'due_date'];
  const providedKeys = Object.keys(data).filter((key) => allowedKeys.includes(key));

  if (providedKeys.length === 0) {
    return {
      ok: false,
      errors: ['At least one field (title, description, status, priority, due_date) must be provided.'],
    };
  }

  const value: UpdateTaskInput = {};

  if (data.title !== undefined) {
    if (!isNonEmptyString(data.title)) {
      errors.push('title must be a non-empty string.');
    } else if (data.title.trim().length > TITLE_MAX_LENGTH) {
      errors.push(`title must be at most ${TITLE_MAX_LENGTH} characters.`);
    } else {
      value.title = data.title.trim();
    }
  }

  if (data.description !== undefined) {
    if (data.description !== null && typeof data.description !== 'string') {
      errors.push('description must be a string or null.');
    } else {
      value.description = normalizeOptionalText(data.description) ?? null;
    }
  }

  if (data.status !== undefined) {
    if (!isValidStatus(data.status)) {
      errors.push(`status must be one of: ${TASK_STATUSES.join(', ')}.`);
    } else {
      value.status = data.status;
    }
  }

  if (data.priority !== undefined) {
    if (!isValidPriority(data.priority)) {
      errors.push(`priority must be one of: ${TASK_PRIORITIES.join(', ')}.`);
    } else {
      value.priority = data.priority;
    }
  }

  if (data.due_date !== undefined) {
    if (!isValidDate(data.due_date)) {
      errors.push('due_date must be a valid date in YYYY-MM-DD format, null, or empty string.');
    } else {
      value.due_date = normalizeDueDate(data.due_date) ?? null;
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, errors: [], value };
}
