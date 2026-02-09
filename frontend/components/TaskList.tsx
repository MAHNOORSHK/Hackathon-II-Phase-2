'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { LoadingSpinner } from './LoadingSpinner';
import { apiGet, apiPatch, apiDelete } from '@/lib/api';
import { getTasks, deleteTask as deleteTaskLocal, updateTask as updateTaskLocal } from '@/lib/tasks-storage';
import { getSession } from '@/lib/auth-client';

interface Task {
  id: string | number;
  title: string;
  description: string;
  completed: boolean;
  createdAt?: string;
}

interface TaskListProps {
  onEditClick?: (task?: Task) => void;
  refreshTrigger?: number;
  onTasksLoaded?: (tasks: Task[]) => void;
}

export function TaskList({ onEditClick, refreshTrigger = 0, onTasksLoaded }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Get user session to get user ID
      const session = await getSession();
      const userId = session?.user?.id;

      if (!userId) {
        console.log('[TaskList] No user ID, loading from local storage');
        const localTasks = getTasks();
        setTasks(localTasks);
        onTasksLoaded?.(localTasks);
        return;
      }

      // Try backend first
      try {
        const response = await apiGet(`/${userId}/tasks`);
        if (Array.isArray(response)) {
          const mappedTasks = response.map((task: any) => ({
            id: task.id.toString(),
            title: task.title,
            description: task.description || '',
            completed: task.completed || false,
            createdAt: task.created_at,
          }));
          setTasks(mappedTasks);
          onTasksLoaded?.(mappedTasks);
        } else {
          setTasks([]);
          onTasksLoaded?.([]);
        }
      } catch (err) {
        // Backend unavailable, load from local storage
        console.log('[TaskList] Backend unavailable, loading from local storage:', err);
        const localTasks = getTasks();
        setTasks(localTasks);
        onTasksLoaded?.(localTasks);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tasks';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [onTasksLoaded]);

  // Fetch tasks on mount and when refreshTrigger changes
  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger, fetchTasks]);

  const handleDelete = useCallback(
    async (taskId: string) => {
      try {
        // Get user session to get user ID
        const session = await getSession();
        const userId = session?.user?.id;

        if (!userId) {
          deleteTaskLocal(taskId);
          const updatedTasks = tasks.filter((t) => t.id !== taskId);
          setTasks(updatedTasks);
          onTasksLoaded?.(updatedTasks);
          return;
        }

        // Try backend first
        try {
          await apiDelete(`/${userId}/tasks/${taskId}`);
        } catch (err) {
          console.log('[TaskList] Backend unavailable, deleting from local storage:', err);
          deleteTaskLocal(taskId);
        }
        const updatedTasks = tasks.filter((t) => t.id !== taskId);
        setTasks(updatedTasks);
        onTasksLoaded?.(updatedTasks);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
        setError(errorMessage);
        throw err;
      }
    },
    [tasks, onTasksLoaded]
  );

  const handleToggleComplete = useCallback(
    async (taskId: string, completed: boolean) => {
      try {
        // Get user session to get user ID
        const session = await getSession();
        const userId = session?.user?.id;

        if (!userId) {
          updateTaskLocal(taskId, { completed });
          const updatedTasks = tasks.map((t) => (t.id === taskId ? { ...t, completed } : t));
          setTasks(updatedTasks);
          onTasksLoaded?.(updatedTasks);
          return;
        }

        // Try backend first
        try {
          await apiPatch(`/${userId}/tasks/${taskId}/complete`);
        } catch (err) {
          console.log('[TaskList] Backend unavailable, updating in local storage:', err);
          updateTaskLocal(taskId, { completed });
        }
        const updatedTasks = tasks.map((t) => (t.id === taskId ? { ...t, completed } : t));
        setTasks(updatedTasks);
        onTasksLoaded?.(updatedTasks);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
        setError(errorMessage);
        throw err;
      }
    },
    [tasks, onTasksLoaded]
  );

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          <button
            onClick={handleRetry}
            className="text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium text-sm ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <Plus className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No tasks yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first task to get started
          </p>
          <button
            onClick={onEditClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Plus className="h-5 w-5" />
            Create First Task
          </button>
        </div>
      )}

      {/* Task Grid */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => onEditClick?.(task)}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
              isLoading={loading}
            />
          ))}
        </div>
      )}

      {/* Loading Overlay for Refresh */}
      {loading && tasks.length > 0 && (
        <div className="fixed inset-0 bg-black/10 dark:bg-black/20 flex items-center justify-center z-40">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}
