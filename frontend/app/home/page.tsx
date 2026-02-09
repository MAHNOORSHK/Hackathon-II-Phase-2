'use client';

import Link from 'next/link';
import { CheckCircle, Zap, Lock, Smartphone } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Stay Organized,
            <span className="block text-indigo-600 dark:text-indigo-400">Get More Done</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            A beautiful, modern task management application that helps you organize your daily tasks and boost productivity.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/signin"
              className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400 font-semibold rounded-lg border-2 border-indigo-600 dark:border-indigo-400 transition-all duration-200"
            >
              Create Account
            </Link>
          </div>

          {/* Hero Image */}
          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl p-8 backdrop-blur-sm border border-indigo-200 dark:border-indigo-800/50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-56"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-44"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 md:px-6 bg-white dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            Why Choose Todo Pro?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-8 rounded-xl border border-indigo-200 dark:border-indigo-800/50 hover:shadow-lg transition-all duration-200">
              <CheckCircle className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Easy to Use</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Simple, intuitive interface that anyone can use instantly
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-8 rounded-xl border border-purple-200 dark:border-purple-800/50 hover:shadow-lg transition-all duration-200">
              <Zap className="w-12 h-12 text-purple-600 dark:text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Instant task creation and updates with zero lag
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-8 rounded-xl border border-blue-200 dark:border-blue-800/50 hover:shadow-lg transition-all duration-200">
              <Lock className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Secure</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your data is encrypted and completely private
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-8 rounded-xl border border-green-200 dark:border-green-800/50 hover:shadow-lg transition-all duration-200">
              <Smartphone className="w-12 h-12 text-green-600 dark:text-green-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Responsive</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Works perfectly on mobile, tablet, and desktop
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to boost your productivity?
          </h2>
          <p className="text-indigo-100 mb-8">
            Join thousands of users who are already managing their tasks efficiently
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors duration-200"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 px-4 md:px-6">
        <div className="max-w-6xl mx-auto text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2026 Todo Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
