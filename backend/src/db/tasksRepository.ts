import { QueryResultRow } from 'pg';
import { pool } from '../db/pool';
import { CreateTaskInput, Task, UpdateTaskInput } from '../types/task';

function formatDueDate(value: unknown): string | null {
  if (value == null) {
    return null;
  }

  // node-postgres returns DATE columns as JavaScript Date objects at local midnight.
  // Building the string from calendar parts keeps the same day the user stored.
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const text = String(value);
  return text.length >= 10 ? text.slice(0, 10) : text;
}

function mapTask(row: QueryResultRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    due_date: formatDueDate(row.due_date),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}

export async function findAllTasks(filters?: {
  status?: string;
  search?: string;
}): Promise<Task[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters?.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  if (filters?.search) {
    values.push(`%${filters.search}%`);
    conditions.push(`title ILIKE $${values.length}`);
  }

  let query = `
    SELECT id, title, description, status, priority, due_date, created_at, updated_at
    FROM tasks
  `;

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ' ORDER BY created_at DESC';

  const result = await pool.query(query, values);
  return result.rows.map(mapTask);
}

export async function findTaskById(id: string): Promise<Task | null> {
  const result = await pool.query(
    `
      SELECT id, title, description, status, priority, due_date, created_at, updated_at
      FROM tasks
      WHERE id = $1
    `,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapTask(result.rows[0]);
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const result = await pool.query(
    `
      INSERT INTO tasks (title, description, status, priority, due_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, title, description, status, priority, due_date, created_at, updated_at
    `,
    [
      input.title,
      input.description ?? null,
      input.status ?? 'TODO',
      input.priority ?? 'MEDIUM',
      input.due_date ?? null,
    ]
  );

  return mapTask(result.rows[0]);
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (input.title !== undefined) {
    values.push(input.title);
    fields.push(`title = $${values.length}`);
  }

  if (input.description !== undefined) {
    values.push(input.description);
    fields.push(`description = $${values.length}`);
  }

  if (input.status !== undefined) {
    values.push(input.status);
    fields.push(`status = $${values.length}`);
  }

  if (input.priority !== undefined) {
    values.push(input.priority);
    fields.push(`priority = $${values.length}`);
  }

  if (input.due_date !== undefined) {
    values.push(input.due_date);
    fields.push(`due_date = $${values.length}`);
  }

  if (fields.length === 0) {
    return findTaskById(id);
  }

  values.push(id);

  const result = await pool.query(
    `
      UPDATE tasks
      SET ${fields.join(', ')}
      WHERE id = $${values.length}
      RETURNING id, title, description, status, priority, due_date, created_at, updated_at
    `,
    values
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapTask(result.rows[0]);
}

export async function deleteTask(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
  return result.rows.length > 0;
}
