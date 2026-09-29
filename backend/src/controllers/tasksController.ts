import { Request, Response, NextFunction } from 'express';
import * as defaultRepository from '../db/tasksRepository';
import { TASK_STATUSES, CreateTaskInput, UpdateTaskInput, Task } from '../types/task';
import { validateCreateTask, validateUpdateTask } from '../utils/validation';

export interface TasksRepository {
  findAllTasks(filters?: { status?: string; search?: string }): Promise<Task[]>;
  findTaskById(id: string): Promise<Task | null>;
  createTask(input: CreateTaskInput): Promise<Task>;
  updateTask(id: string, input: UpdateTaskInput): Promise<Task | null>;
  deleteTask(id: string): Promise<boolean>;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(id: string): boolean {
  return UUID_REGEX.test(id);
}

export function createTasksController(repository: TasksRepository = defaultRepository) {
  async function getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;

      if (
        status &&
        status !== 'ALL' &&
        !TASK_STATUSES.includes(status as (typeof TASK_STATUSES)[number])
      ) {
        res.status(400).json({
          error: `Invalid status filter. Use one of: ALL, ${TASK_STATUSES.join(', ')}.`,
        });
        return;
      }

      const tasks = await repository.findAllTasks({
        status: status && status !== 'ALL' ? status : undefined,
        search: search || undefined,
      });

      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  }

  async function getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidUuid(id)) {
        res.status(400).json({ error: 'Invalid task id format.' });
        return;
      }

      const task = await repository.findTaskById(id);

      if (!task) {
        res.status(404).json({ error: 'Task not found.' });
        return;
      }

      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  }

  async function createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = validateCreateTask(req.body);

      if (!validation.ok || !validation.value) {
        res.status(400).json({ error: 'Validation failed.', details: validation.errors });
        return;
      }

      const task = await repository.createTask(validation.value as CreateTaskInput);
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }

  async function updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidUuid(id)) {
        res.status(400).json({ error: 'Invalid task id format.' });
        return;
      }

      const validation = validateUpdateTask(req.body);

      if (!validation.ok || !validation.value) {
        res.status(400).json({ error: 'Validation failed.', details: validation.errors });
        return;
      }

      const task = await repository.updateTask(id, validation.value as UpdateTaskInput);

      if (!task) {
        res.status(404).json({ error: 'Task not found.' });
        return;
      }

      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  }

  async function removeTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidUuid(id)) {
        res.status(400).json({ error: 'Invalid task id format.' });
        return;
      }

      const deleted = await repository.deleteTask(id);

      if (!deleted) {
        res.status(404).json({ error: 'Task not found.' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  return {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    removeTask,
  };
}
