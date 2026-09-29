import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../app';
import { Task } from '../types/task';
import { createInMemoryTasksRepository } from './inMemoryRepository';

const existingTask: Task = {
  id: '11111111-1111-4111-8111-111111111111',
  title: 'Write the API tests',
  description: 'Cover the main endpoints.',
  status: 'TODO',
  priority: 'MEDIUM',
  due_date: '2026-10-15',
  created_at: '2026-09-01T10:00:00.000Z',
  updated_at: '2026-09-01T10:00:00.000Z',
};

const missingId = '22222222-2222-4222-8222-222222222222';

function createTestApp(seed: Task[] = [existingTask]) {
  return createApp(createInMemoryTasksRepository(seed));
}

describe('GET /api/tasks', () => {
  it('returns the stored tasks', async () => {
    const response = await request(createTestApp()).get('/api/tasks');

    assert.equal(response.status, 200);
    assert.equal(response.body.length, 1);
    assert.equal(response.body[0].title, existingTask.title);
    assert.equal(response.body[0].status, 'TODO');
  });

  it('filters by status and searches by title', async () => {
    const response = await request(createTestApp())
      .get('/api/tasks')
      .query({ status: 'TODO', search: 'API' });

    assert.equal(response.status, 200);
    assert.equal(response.body.length, 1);

    const empty = await request(createTestApp())
      .get('/api/tasks')
      .query({ search: 'does-not-exist' });

    assert.equal(empty.status, 200);
    assert.deepEqual(empty.body, []);
  });
});

describe('POST /api/tasks', () => {
  it('creates a task and returns it', async () => {
    const response = await request(createTestApp([])).post('/api/tasks').send({
      title: 'Prepare the demo',
      description: 'Walk through create, edit, and delete.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      due_date: '2026-11-01',
    });

    assert.equal(response.status, 201);
    assert.equal(response.body.title, 'Prepare the demo');
    assert.equal(response.body.status, 'IN_PROGRESS');
    assert.equal(response.body.priority, 'HIGH');
    assert.equal(response.body.due_date, '2026-11-01');
    assert.ok(response.body.id);
  });

  it('rejects invalid task input', async () => {
    const missingTitle = await request(createTestApp([])).post('/api/tasks').send({
      description: 'No title',
    });

    assert.equal(missingTitle.status, 400);
    assert.equal(missingTitle.body.error, 'Validation failed.');
    assert.ok(missingTitle.body.details.some((message: string) => message.includes('title')));

    const badStatus = await request(createTestApp([])).post('/api/tasks').send({
      title: 'Broken status',
      status: 'LATER',
      priority: 'URGENT',
    });

    assert.equal(badStatus.status, 400);
    assert.ok(badStatus.body.details.some((message: string) => message.includes('status')));
    assert.ok(badStatus.body.details.some((message: string) => message.includes('priority')));
  });
});

describe('PUT /api/tasks/:id', () => {
  it('updates an existing task', async () => {
    const response = await request(createTestApp()).put(`/api/tasks/${existingTask.id}`).send({
      title: 'Write the API tests',
      status: 'DONE',
      priority: 'LOW',
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.status, 'DONE');
    assert.equal(response.body.priority, 'LOW');
    assert.equal(response.body.title, 'Write the API tests');
  });

  it('returns 404 when the task does not exist', async () => {
    const response = await request(createTestApp([])).put(`/api/tasks/${missingId}`).send({
      title: 'Missing',
    });

    assert.equal(response.status, 404);
    assert.equal(response.body.error, 'Task not found.');
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('deletes an existing task', async () => {
    const app = createTestApp();
    const deleted = await request(app).delete(`/api/tasks/${existingTask.id}`);

    assert.equal(deleted.status, 204);

    const after = await request(app).get('/api/tasks');
    assert.deepEqual(after.body, []);
  });

  it('returns 404 when the task does not exist', async () => {
    const response = await request(createTestApp([])).delete(`/api/tasks/${missingId}`);

    assert.equal(response.status, 404);
    assert.equal(response.body.error, 'Task not found.');
  });
});

describe('GET /api/tasks/:id', () => {
  it('returns 404 when the task does not exist', async () => {
    const response = await request(createTestApp([])).get(`/api/tasks/${missingId}`);

    assert.equal(response.status, 404);
    assert.equal(response.body.error, 'Task not found.');
  });
});
