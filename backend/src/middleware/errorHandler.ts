import { Request, Response, NextFunction } from 'express';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Route not found.' });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Unhandled error:', err);

  if (err && typeof err === 'object' && 'code' in err) {
    const dbError = err as { code?: string; message?: string };

    if (dbError.code === '22P02') {
      res.status(400).json({ error: 'Invalid data format.' });
      return;
    }

    if (dbError.code === '23514') {
      res.status(400).json({ error: 'Data failed a database constraint check.' });
      return;
    }
  }

  res.status(500).json({ error: 'Internal server error.' });
}
