'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, Zap, Shield } from 'lucide-react';
import { getSession } from '@/lib/auth-client';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showHome, setShowHome] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getSession();
        if (session?.user) {
          // Already logged in, redirect to dashboard
          router.push('/dashboard');
        } else {
          // Not logged in, show landing page
          setShowHome(true);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setShowHome(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading || !showHome) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 transition-colors">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Todo Pro</h1>
          <div className="flex gap-4">
            <Link
              href="/signin"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Organize Your Life,{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            One Task at a Time
          </span>
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
          A beautiful, modern task management app built with Next.js. Create, organize, and track your tasks with an intuitive interface and powerful features.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all text-lg"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors text-lg"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Todo Pro?</h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Everything you need to stay organized and productive</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center mb-6">
              <CheckCircle2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Simple & Intuitive</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Easy-to-use interface that helps you focus on what matters. Create, edit, and organize tasks in seconds.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Lightning Fast</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Instant task creation and updates. Real-time synchronization with our secure backend.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Secure & Private</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Your data is encrypted and stored securely. Only you can access your tasks.
            </p>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-indigo-50 dark:bg-indigo-950/30 rounded-3xl">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How to Get Started</h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Simple steps to manage your tasks effectively</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-600 text-white font-bold rounded-full flex items-center justify-center mx-auto mb-4 text-lg">
              1
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Create Account</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sign up with your email and create a secure password.
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-600 text-white font-bold rounded-full flex items-center justify-center mx-auto mb-4 text-lg">
              2
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Add Tasks</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click "New Task" and enter your task title and description.
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-600 text-white font-bold rounded-full flex items-center justify-center mx-auto mb-4 text-lg">
              3
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Manage Tasks</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Edit, delete, or mark tasks as complete with ease.
            </p>
          </div>

          {/* Step 4 */}
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-600 text-white font-bold rounded-full flex items-center justify-center mx-auto mb-4 text-lg">
              4
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Stay Organized</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track your progress and stay focused on what's important.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 border border-gray-200 dark:border-gray-700">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ready to Get Started?</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            Join thousands of users organizing their tasks with Todo Pro. It's free and takes less than a minute.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/signup"
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Create Free Account
            </Link>
            <Link
              href="/signin"
              className="px-8 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Todo Pro</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                A modern task management app built with Next.js and Tailwind CSS.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>Create & manage tasks</li>
                <li>Dark mode support</li>
                <li>Secure authentication</li>
                <li>Real-time sync</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Creator</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Made with ❤️ by <strong>Mahnoor Shaikh</strong>
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">© 2026. All rights reserved.</p>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Hackathon II Phase 2 - Todo Web APP with Modern UI/UX
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
