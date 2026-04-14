const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('tasks routes', () => {
  beforeEach(() => {
    taskService._reset();
  });

  test('lists tasks, filters by status, and paginates', async () => {
    const first = taskService.create({ title: 'Task 1', status: 'todo' });
    taskService.create({ title: 'Task 2', status: 'in_progress' });
    const third = taskService.create({ title: 'Task 3', status: 'todo' });

    const allResponse = await request(app).get('/tasks');
    expect(allResponse.status).toBe(200);
    expect(allResponse.body).toHaveLength(3);

    const filteredResponse = await request(app).get('/tasks').query({ status: 'todo' });
    expect(filteredResponse.status).toBe(200);
    expect(filteredResponse.body).toEqual([first, third]);

    const paginatedResponse = await request(app).get('/tasks').query({ page: 1, limit: 2 });
    expect(paginatedResponse.status).toBe(200);
    expect(paginatedResponse.body).toEqual([first, taskService.getAll()[1]]);
  });

  test('creates, updates, completes, assigns, and deletes tasks', async () => {
    const createResponse = await request(app)
      .post('/tasks')
      .send({ title: 'Ship feature', priority: 'high' });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      title: 'Ship feature',
      priority: 'high',
      assignee: null,
    });

    const taskId = createResponse.body.id;

    const assignResponse = await request(app)
      .patch(`/tasks/${taskId}/assign`)
      .send({ assignee: 'Maya' });
    expect(assignResponse.status).toBe(200);
    expect(assignResponse.body.assignee).toBe('Maya');

    const reassignResponse = await request(app)
      .patch(`/tasks/${taskId}/assign`)
      .send({ assignee: 'Noah' });
    expect(reassignResponse.status).toBe(200);
    expect(reassignResponse.body.assignee).toBe('Noah');

    const updateResponse = await request(app)
      .put(`/tasks/${taskId}`)
      .send({ description: 'Updated description', status: 'in_progress' });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toMatchObject({
      description: 'Updated description',
      status: 'in_progress',
    });

    const completeResponse = await request(app).patch(`/tasks/${taskId}/complete`);
    expect(completeResponse.status).toBe(200);
    expect(completeResponse.body.status).toBe('done');
    expect(completeResponse.body.completedAt).toEqual(expect.any(String));

    const deleteResponse = await request(app).delete(`/tasks/${taskId}`);
    expect(deleteResponse.status).toBe(204);
  });

  test('returns validation and not-found errors for edge cases', async () => {
    const invalidCreate = await request(app).post('/tasks').send({ title: '' });
    expect(invalidCreate.status).toBe(400);

    const invalidAssign = await request(app).patch('/tasks/does-not-exist/assign').send({ assignee: '' });
    expect(invalidAssign.status).toBe(400);

    const notFoundAssign = await request(app).patch('/tasks/does-not-exist/assign').send({ assignee: 'Maya' });
    expect(notFoundAssign.status).toBe(404);

    const notFoundUpdate = await request(app).put('/tasks/does-not-exist').send({ title: 'Missing' });
    expect(notFoundUpdate.status).toBe(404);

    const notFoundDelete = await request(app).delete('/tasks/does-not-exist');
    expect(notFoundDelete.status).toBe(404);
  });

  test('returns task statistics', async () => {
    taskService.create({ title: 'Overdue', status: 'todo', dueDate: '2000-01-01T00:00:00.000Z' });
    taskService.create({ title: 'Done', status: 'done' });

    const response = await request(app).get('/tasks/stats');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      todo: 1,
      in_progress: 0,
      done: 1,
      overdue: 1,
    });
  });
});