import { randomUUID } from 'crypto';
import {
  CreateTaskInput,
  Task,
  UpdateTaskInput,
} from '../types/task';
import { TasksRepository } from '../controllers/tasksController';

/** Simple in-memory repository used by API tests (no real database needed). */
export function createInMemoryTasksRepository(seed: Task[] = []): TasksRepository {
  const tasks = new Map<string, Task>(seed.map((task) => [task.id, { ...task }]));

  return {
    async findAllTasks(filters) {
      let result = Array.from(tasks.values());

      if (filters?.status) {
        result = result.filter((task) => task.status === filters.status);
      }

      if (filters?.search) {
        const term = filters.search.toLowerCase();
        result = result.filter((task) => task.title.toLowerCase().includes(term));
      }

      return result.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },

    async findTaskById(id) {
      return tasks.get(id) ?? null;
    },

    async createTask(input: CreateTaskInput) {
      const now = new Date().toISOString();
      const task: Task = {
        id: randomUUID(),
        title: input.title,
        description: input.description ?? null,
        status: input.status ?? 'TODO',
        priority: input.priority ?? 'MEDIUM',
        due_date: input.due_date ?? null,
        created_at: now,
        updated_at: now,
      };
      tasks.set(task.id, task);
      return { ...task };
    },

    async updateTask(id: string, input: UpdateTaskInput) {
      const existing = tasks.get(id);
      if (!existing) {
        return null;
      }

      const updated: Task = {
        ...existing,
        ...input,
        description: input.description === undefined ? existing.description : input.description,
        due_date: input.due_date === undefined ? existing.due_date : input.due_date,
        updated_at: new Date().toISOString(),
      };

      tasks.set(id, updated);
      return { ...updated };
    },

    async deleteTask(id: string) {
      return tasks.delete(id);
    },
  };
}
