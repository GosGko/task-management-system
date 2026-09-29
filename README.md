# Task Management System

A small full-stack app for creating, editing, filtering, and completing tasks. The React frontend talks to an Express REST API, and the API stores tasks in PostgreSQL.

## Project overview

A user opens the React app, loads the task list, and can create, edit, delete, and move tasks between statuses. Each change is sent to the API with `fetch`. Express validates the body, the repository runs SQL through a PostgreSQL connection pool, and the UI updates from the JSON response.

Search and status filtering happen in the browser after the list is loaded. `GET /api/tasks` also accepts optional `status` and `search` query parameters.

## Features

- View all tasks
- Create a task
- Edit a task
- Delete a task
- Change task status (`TODO`, `IN_PROGRESS`, `DONE`)
- Filter tasks by status
- Search tasks by title
- Set task priority (`LOW`, `MEDIUM`, `HIGH`)
- Set an optional due date
- Loading, error, and empty states in the UI
- Request validation and JSON error responses in the API

## Architecture

```
Browser (React)
    |
    |  HTTP JSON
    v
Express API
    |
    |  SQL
    v
PostgreSQL tasks table
```

The backend is split so each file has one job:

- `backend/src/index.ts` loads environment variables, checks the database connection, and starts the server
- `backend/src/app.ts` configures Express, CORS, and routes
- `backend/src/routes/tasks.ts` maps URLs to controller functions
- `backend/src/controllers/tasksController.ts` handles HTTP status codes
- `backend/src/utils/validation.ts` checks incoming task data
- `backend/src/db/tasksRepository.ts` runs SQL
- `backend/src/db/pool.ts` creates the PostgreSQL connection pool

The frontend keeps the task list in React state inside `TaskManager`. After create, update, and delete, that state is replaced with the API response.

## Tech stack

- Frontend: React, TypeScript, Vite, CSS, `fetch`
- Backend: Node.js, Express, TypeScript, CORS, dotenv
- Database: PostgreSQL through the `pg` package
- Tests: Node.js built-in test runner and Supertest

## Project structure

```
task-management-system/
  frontend/                 React application
    src/components/
      TaskManager.tsx       Task list state and API calls
      TaskList.tsx          List or empty state
      TaskCard.tsx          One task, status controls, edit, and delete
      TaskForm.tsx          Create and edit form
      FilterBar.tsx         Search, status filter, and create button
      StatusMessage.tsx     Success and error messages
  backend/                  Express API
    src/tests/              API tests and the in-memory store they use
  database/
    schema.sql              Table, enums, and updated_at trigger
    seed.sql                Sample tasks
  README.md
```

## PostgreSQL setup

Install PostgreSQL 14 or newer. The schema uses `EXECUTE FUNCTION` for the `updated_at` trigger, which requires PostgreSQL 14+.

From the project root, with `psql` on your PATH:

```bash
psql -U postgres -c "CREATE DATABASE task_management;"
psql -U postgres -d task_management -f database/schema.sql
psql -U postgres -d task_management -f database/seed.sql
```

If `psql` is not recognized on Windows, call the executable in the PostgreSQL `bin` folder. For PostgreSQL 17 that is often:

```bash
"/c/Program Files/PostgreSQL/17/bin/psql.exe" -U postgres -c "CREATE DATABASE task_management;"
"/c/Program Files/PostgreSQL/17/bin/psql.exe" -U postgres -d task_management -f database/schema.sql
"/c/Program Files/PostgreSQL/17/bin/psql.exe" -U postgres -d task_management -f database/seed.sql
```

`schema.sql` creates the `tasks` table. `id` is a UUID. `status` and `priority` are PostgreSQL enums. `created_at` and `updated_at` are timestamps, and a trigger sets `updated_at` on every update. `title` is required, at most 200 characters, and cannot be blank. `description` and `due_date` are optional.

## Environment variables

Copy the example files and set your own database password. The examples contain placeholders only. Do not commit `.env`.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

On Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Backend (`backend/.env`):

| Variable | Purpose |
| --- | --- |
| `PORT` | API port. The example uses `5000`. |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password. Replace `your_password_here`. |
| `FRONTEND_ORIGIN` | Browser origin allowed by CORS. `localhost` and `127.0.0.1` are both accepted for this origin. |

Frontend (`frontend/.env`):

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Base URL of the API. The example is `http://localhost:5000`, which matches the backend port. |

The API reads these variables with `dotenv`. The frontend reads `VITE_API_URL` through Vite. If `VITE_API_URL` is omitted, the app also falls back to `http://localhost:5000`.

## How to run backend

```bash
cd backend
npm install
npm run dev
```

The API listens on `http://localhost:5000` unless `PORT` is changed. `npm run dev` restarts the server when backend files change.

Production build:

```bash
cd backend
npm run build
npm start
```

## How to run frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

Production build:

```bash
cd frontend
npm run build
npm run preview
```

## API endpoints

| Method | Path | Success | Notes |
| --- | --- | --- | --- |
| `GET` | `/api/health` | `200` | Returns `{ "status": "ok" }`. |
| `GET` | `/api/tasks` | `200` | Returns an array. Optional query: `status`, `search`. |
| `GET` | `/api/tasks/:id` | `200` | Returns one task. |
| `POST` | `/api/tasks` | `201` | Creates a task. |
| `PUT` | `/api/tasks/:id` | `200` | Updates one or more fields. |
| `DELETE` | `/api/tasks/:id` | `204` | Deletes a task and returns an empty body. |

Example create body:

```json
{
  "title": "Prepare the demo",
  "description": "Walk through create, edit, and delete.",
  "status": "TODO",
  "priority": "MEDIUM",
  "due_date": "2026-11-01"
}
```

`title` is required and can be at most 200 characters. `description` and `due_date` are optional. `status` must be `TODO`, `IN_PROGRESS`, or `DONE`. `priority` must be `LOW`, `MEDIUM`, or `HIGH`. If status or priority is omitted on create, the API uses `TODO` and `MEDIUM`.

Task ids are UUIDs. An id that is not a UUID returns `400`. A valid id that does not exist returns `404`.

Error responses use JSON:

```json
{ "error": "Task not found." }
```

Validation errors use status `400` and include a `details` array. Database and unexpected failures use `500` and do not include SQL or credentials in the response.

## Testing

API tests use an in-memory task store, so they do not need PostgreSQL to be running.

```bash
cd backend
npm test
```

The tests cover:

- `GET` tasks
- `POST` task
- `PUT` task
- `DELETE` task
- invalid task input
- task not found

## Screenshots

Add screenshots here after you run the app:

- Task list with a few tasks
- Create / edit form
- Empty state
- Error state when the API is stopped

## What I learned

- A relational table with constraints is the source of truth for a task.
- The API checks input before it reaches SQL, then maps database rows into JSON.
- React state should be updated from the API response after create, update, and delete, so the screen matches what was saved.
- Loading, empty, and error states need to be designed on purpose. A failed request should show a message instead of failing quietly.
- Tests can exercise the HTTP layer without a real database by passing a fake repository into `createApp`.

## Future improvements

- User accounts and login
- Assigning a task to a person
- Pagination when the list gets long
- Sorting by due date or priority
- Drag-and-drop between status columns
