import cors from 'cors';
import express from 'express';
import { createTasksRouter } from './routes/tasks';
import { TasksRepository } from './controllers/tasksController';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApp(repository?: TasksRepository) {
  const app = express();

  const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
  const allowedOrigins = [
    frontendOrigin,
    frontendOrigin.replace('://localhost', '://127.0.0.1'),
    frontendOrigin.replace('://127.0.0.1', '://localhost'),
  ];

  app.use(
    cors({
      origin: allowedOrigins,
    })
  );
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/tasks', createTasksRouter(repository));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
