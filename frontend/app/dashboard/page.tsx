'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, CheckCircle2, Circle } from 'lucide-react';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getSession } from '@/lib/auth-client';
import { apiPost, apiPut } from '@/lib/api';
import { saveTask, updateTask } from '@/lib/tasks-storage';

export default function DashboardPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getSession();
        if (!session?.user?.id) {
          router.push('/signin');
        } else {
          setUserId(session.user.id);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        router.push('/signin');
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleFormSubmit = async (data: { title: string; description: string }) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    setSubmitting(true);

    try {
      if (editingTask && editingTask.id) {
        // EDIT MODE: Update existing task - try backend first, fallback to local storage
        console.log(`[Dashboard] EDIT MODE: Updating task ${editingTask.id}`);

        try {
          const result = await apiPut(`/${userId}/tasks/${editingTask.id}`, data);
          console.log(`[Dashboard] Task ${editingTask.id} updated successfully:`, result);
        } catch (err) {
          console.log(`[Dashboard] Backend unavailable, updating task ${editingTask.id} in local storage`);
          updateTask(editingTask.id, data);
        }
      } else {
        // CREATE MODE: Create new task - try backend first, fallback to local storage
        console.log(`[Dashboard] CREATE MODE: Creating new task with title "${data.title}"`);

        try {
          const createdTask = await apiPost(`/${userId}/tasks`, { ...data, user_id: userId });
          console.log(`[Dashboard] New task created with ID: ${createdTask?.id}`, createdTask);

          // Verify we got a valid response with ID
          if (!createdTask || !createdTask.id) {
            throw new Error('No task ID received from server');
          }
        } catch (err) {
          console.log(`[Dashboard] Backend unavailable, saving new task to local storage`);
          saveTask({
            title: data.title,
            description: data.description,
            completed: false,
          });
        }
      }

      // Refresh task list and close form
      console.log(`[Dashboard] Refreshing task list and closing form`);
      setRefreshTrigger((prev) => prev + 1);
      setShowForm(false);
      setEditingTask(null);
    } catch (err) {
      console.error('[Dashboard] Form submission error:', err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (task?: any) => {
    // If task is undefined or has no id, open form in CREATE mode
    // Otherwise open in EDIT mode
    setShowForm(true);
    setEditingTask(task && task.id ? task : null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 dark:bg-gray-950 py-8 px-4 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              My Tasks
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Organize and track all your tasks
            </p>
          </div>

          {/* Create Task Button */}
          <button
            onClick={handleEditClick}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
          >
            <Plus className="h-5 w-5" />
            New Task
          </button>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Total Tasks Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalTasks}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center">
                <Circle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>

          {/* Completed Tasks Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Completed Tasks</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{completedTasks}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Task Form */}
        {showForm && (
          <TaskForm
            task={editingTask}
            isLoading={submitting}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        )}

        {/* Task List with Counters */}
        {userId && (
          <TaskList
            onEditClick={handleEditClick}
            refreshTrigger={refreshTrigger}
            onTasksLoaded={(tasks) => {
              // Update counters when tasks are loaded
              setTotalTasks(tasks.length);
              setCompletedTasks(tasks.filter((t) => t.completed).length);
              console.log(`[Dashboard] Tasks loaded: total=${tasks.length}, completed=${tasks.filter((t) => t.completed).length}`);
            }}
          />
        )}
      </div>
    </main>
  );
}
