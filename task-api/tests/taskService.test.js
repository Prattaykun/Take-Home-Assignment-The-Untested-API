const taskService = require('../src/services/taskService');

describe('taskService', () => {
  beforeEach(() => {
    taskService._reset();
  });

  test('creates a task with defaults and persists it', () => {
    const task = taskService.create({ title: 'Write tests' });

    expect(task).toMatchObject({
      title: 'Write tests',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      assignee: null,
      completedAt: null,
    });
    expect(task.id).toEqual(expect.any(String));
    expect(task.createdAt).toEqual(expect.any(String));
    expect(taskService.getAll()).toHaveLength(1);
  });

  test('filters tasks by exact status', () => {
    const todoTask = taskService.create({ title: 'Todo task', status: 'todo' });
    const inProgressTask = taskService.create({ title: 'Progress task', status: 'in_progress' });

    expect(taskService.getByStatus('todo')).toEqual([todoTask]);
    expect(taskService.getByStatus('in_progress')).toEqual([inProgressTask]);
  });

  test('paginates from the first page correctly', () => {
    const first = taskService.create({ title: 'Task 1' });
    const second = taskService.create({ title: 'Task 2' });
    taskService.create({ title: 'Task 3' });

    expect(taskService.getPaginated(1, 2)).toEqual([first, second]);
  });

  test('updates stats and completion timestamps', () => {
    const overdue = taskService.create({
      title: 'Overdue task',
      status: 'todo',
      dueDate: '2000-01-01T00:00:00.000Z',
    });
    const done = taskService.create({ title: 'Done task', status: 'done' });

    const stats = taskService.getStats();
    expect(stats).toMatchObject({
      todo: 1,
      in_progress: 0,
      done: 1,
      overdue: 1,
    });

    const completed = taskService.completeTask(overdue.id);
    expect(completed).toMatchObject({
      id: overdue.id,
      status: 'done',
    });
    expect(completed.completedAt).toEqual(expect.any(String));
    expect(taskService.findById(done.id)).toMatchObject({ status: 'done' });
  });

  test('assigns and reassigns a task', () => {
    const task = taskService.create({ title: 'Assignable task' });

    const assigned = taskService.assignTask(task.id, 'Ada Lovelace');
    expect(assigned).toMatchObject({ assignee: 'Ada Lovelace' });

    const reassigned = taskService.assignTask(task.id, 'Grace Hopper');
    expect(reassigned).toMatchObject({ assignee: 'Grace Hopper' });
  });
});