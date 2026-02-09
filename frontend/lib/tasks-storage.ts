// Local storage utility for tasks (used when backend is unavailable)

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

const TASKS_STORAGE_KEY = 'user_tasks';

// Get user ID from session to namespace tasks per user
function getUserId(): string {
  if (typeof window === 'undefined') return 'default';

  try {
    const session = sessionStorage.getItem('auth_session');
    if (session) {
      const parsed = JSON.parse(session);
      return parsed.user?.id || 'default';
    }
  } catch (error) {
    console.error('Failed to get user ID:', error);
  }

  return 'default';
}

function getStorageKey(): string {
  return `${TASKS_STORAGE_KEY}_${getUserId()}`;
}

export function getTasks(): Task[] {
  if (typeof window === 'undefined') return [];

  try {
    const key = getStorageKey();
    const tasks = localStorage.getItem(key);
    return tasks ? JSON.parse(tasks) : [];
  } catch (error) {
    console.error('Failed to get tasks:', error);
    return [];
  }
}

export function saveTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
  if (typeof window === 'undefined') throw new Error('Not in browser environment');

  const newTask: Task = {
    id: Math.random().toString(36).substr(2, 9),
    ...task,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const key = getStorageKey();
  const tasks = getTasks();
  tasks.push(newTask);
  localStorage.setItem(key, JSON.stringify(tasks));

  return newTask;
}

export function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Task {
  if (typeof window === 'undefined') throw new Error('Not in browser environment');

  const key = getStorageKey();
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) {
    throw new Error(`Task with id ${id} not found`);
  }

  const updatedTask: Task = {
    ...tasks[index],
    ...updates,
    id: tasks[index].id,
    createdAt: tasks[index].createdAt,
    updatedAt: new Date().toISOString(),
  };

  tasks[index] = updatedTask;
  localStorage.setItem(key, JSON.stringify(tasks));

  return updatedTask;
}

export function deleteTask(id: string): void {
  if (typeof window === 'undefined') throw new Error('Not in browser environment');

  const key = getStorageKey();
  const tasks = getTasks();
  const filtered = tasks.filter(t => t.id !== id);
  localStorage.setItem(key, JSON.stringify(filtered));
}

export function clearAllTasks(): void {
  if (typeof window === 'undefined') return;

  const key = getStorageKey();
  localStorage.removeItem(key);
}
