import { Router } from 'express';
import { createTasksController, TasksRepository } from '../controllers/tasksController';

export function createTasksRouter(repository?: TasksRepository) {
  const router = Router();
  const controller = createTasksController(repository);

  router.get('/', controller.getTasks);
  router.get('/:id', controller.getTaskById);
  router.post('/', controller.createTask);
  router.put('/:id', controller.updateTask);
  router.delete('/:id', controller.removeTask);

  return router;
}
