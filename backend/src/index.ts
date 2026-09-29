import dotenv from 'dotenv';
import { createApp } from './app';
import { pool } from './db/pool';

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
const app = createApp();

const requiredEnv = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'] as const;
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

async function start() {
  if (missingEnv.length > 0) {
    console.error(
      `Missing environment variables: ${missingEnv.join(', ')}. Copy backend/.env.example to backend/.env and set your database password.`
    );
    process.exit(1);
  }

  try {
    await pool.query('SELECT 1');
    console.log('Connected to PostgreSQL.');

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server. Check database connection settings.', error);
    process.exit(1);
  }
}

start();
