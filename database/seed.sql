-- Sample tasks for local development
-- Run after schema.sql

INSERT INTO tasks (title, description, status, priority, due_date)
VALUES
  (
    'Set up project repository',
    'Initialize git, add README, and push the starter project.',
    'DONE',
    'HIGH',
    CURRENT_DATE - INTERVAL '2 days'
  ),
  (
    'Design database schema',
    'Define tables, enums, and constraints for tasks.',
    'DONE',
    'HIGH',
    CURRENT_DATE - INTERVAL '1 day'
  ),
  (
    'Build REST API endpoints',
    'Implement CRUD routes for tasks with validation and error handling.',
    'IN_PROGRESS',
    'HIGH',
    CURRENT_DATE + INTERVAL '3 days'
  ),
  (
    'Create React task board UI',
    'Build list, form, filters, and status controls.',
    'IN_PROGRESS',
    'MEDIUM',
    CURRENT_DATE + INTERVAL '5 days'
  ),
  (
    'Write API integration tests',
    'Cover happy paths and invalid input for all endpoints.',
    'TODO',
    'MEDIUM',
    CURRENT_DATE + INTERVAL '7 days'
  ),
  (
    'Polish responsive layout',
    'Check mobile and desktop layouts, empty states, and loading indicators.',
    'TODO',
    'LOW',
    CURRENT_DATE + INTERVAL '10 days'
  ),
  (
    'Document setup steps',
    'Fill README with install, database, and run instructions.',
    'TODO',
    'LOW',
    NULL
  );
