'use client';

import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface Task {
  id: string | number;
  title: string;
  description: string;
}

interface TaskFormProps {
  task?: Task | any;
  isLoading?: boolean;
  onSubmit: (data: { title: string; description: string }) => Promise<void>;
  onCancel: () => void;
}

export function TaskForm({ task, isLoading = false, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Determine mode: if task exists AND has valid id, it's edit mode. Otherwise create mode.
  const isEditing = !!(task && task.id);
  const isFormValid = title.trim().length > 0;
  const buttonText = isEditing ? 'Update Task' : 'Create Task';

  console.log(`[TaskForm] Rendered with mode=${isEditing ? 'EDIT' : 'CREATE'}, taskId=${task?.id || 'none'}, title="${title}"`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log(`[TaskForm] Submitting ${isEditing ? 'EDIT' : 'CREATE'} request for task "${title}"`);

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    if (title.length > 200) {
      setError('Task title must be less than 200 characters');
      return;
    }

    if (description.length > 1000) {
      setError('Description must be less than 1000 characters');
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
      });
      // Reset form after successful submit (for CREATE mode, form gets closed by parent anyway)
      setTitle('');
      setDescription('');
      console.log(`[TaskForm] ${isEditing ? 'EDIT' : 'CREATE'} successful`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save task';
      setError(errorMsg);
      console.error(`[TaskForm] ${isEditing ? 'EDIT' : 'CREATE'} failed:`, errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Task' : 'Create New Task'}
        </h3>
        <button
          onClick={onCancel}
          aria-label="Close form"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Field */}
        <div>
          <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            maxLength={200}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            disabled={submitting || isLoading}
          />
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {title.length}/200
          </div>
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details (optional)"
            maxLength={1000}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none transition-colors"
            disabled={submitting || isLoading}
          />
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {description.length}/1000
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={!isFormValid || submitting || isLoading}
            className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {submitting ? (
              <>
                <LoadingSpinner />
                {buttonText}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                {buttonText}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting || isLoading}
            className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
