'use client';

import { useState } from 'react';
import { Edit, Trash2, CheckCircle2, Circle } from 'lucide-react';

interface Task {
  id: string | number;
  title: string;
  description: string;
  completed: boolean;
  createdAt?: string;
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  isLoading?: boolean;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
  isLoading = false,
}: TaskCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(task.id);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleComplete = async () => {
    setToggling(true);
    try {
      await onToggleComplete(task.id, !task.completed);
    } catch (err) {
      console.error('Toggle error:', err);
    } finally {
      setToggling(false);
    }
  };

  return (
    <>
      <div
        className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-800 p-4 md:p-6 transition-all duration-200 hover:scale-[1.02] ${
          task.completed ? 'opacity-75' : ''
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Completion Toggle */}
          <button
            onClick={handleToggleComplete}
            disabled={toggling || isLoading}
            className="mt-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded flex-shrink-0"
            aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {task.completed ? (
              <CheckCircle2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Circle className="h-6 w-6" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              className={`text-lg font-semibold break-words ${
                task.completed
                  ? 'line-through text-gray-500 dark:text-gray-400'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p
                className={`mt-2 text-sm break-words line-clamp-2 ${
                  task.completed
                    ? 'text-gray-400 dark:text-gray-500'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {task.description}
              </p>
            )}
            {task.createdAt && (
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                {new Date(task.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => onEdit(task)}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Edit task"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={handleDeleteClick}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              aria-label="Delete task"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete Task?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete &quot;{task.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
