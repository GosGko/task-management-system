import { Task, TaskInput } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  } catch {
    throw new Error('Could not reach the server. Check that the backend is running.');
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;

    try {
      const body = (await response.json()) as { error?: string; details?: string[] };
      if (Array.isArray(body.details) && body.details.length > 0) {
        message = body.details.join(' ');
      } else if (body.error) {
        message = body.error;
      }
    } catch {
      // The response was not JSON. Keep the status message above.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getTasks(): Promise<Task[]> {
  return request<Task[]>('/api/tasks');
}

export function createTask(input: TaskInput): Promise<Task> {
  return request<Task>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateTask(id: string, input: TaskInput): Promise<Task> {
  return request<Task>(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteTask(id: string): Promise<void> {
  return request<void>(`/api/tasks/${id}`, {
    method: 'DELETE',
  });
}
