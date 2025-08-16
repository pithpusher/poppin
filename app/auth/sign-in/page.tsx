'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  ArrowRightIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        // Sign up
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (error) throw error;

        setMessage({
          type: 'success',
          text: 'Check your email for a confirmation link!'
        });
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        // Redirect to home page after successful sign in
        window.location.href = '/';
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'An error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Google sign-in failed. Please try again.'
      });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--bg))] via-[rgb(var(--bg))] to-[rgb(var(--panel))] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isSignUp ? 'Welcome back' : 'Welcome back'}
          </h1>
          <p className="text-[rgb(var(--muted))]">
            {isSignUp ? 'Create your account and dive in' : 'Log in and keep the plans flowing'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-[rgb(var(--panel))] backdrop-blur-sm border border-[rgb(var(--border-color))]/20 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-[rgb(var(--text))]">
                Email Address
              </label>
              <div className="relative group">
                <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted))] group-focus-within:text-[rgb(var(--brand))] transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-[rgb(var(--bg))] text-[rgb(var(--text))] border border-[rgb(var(--border-color))]/20 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))] focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-[rgb(var(--text))]">
                Password
              </label>
              <div className="relative group">
                <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted))] group-focus-within:text-[rgb(var(--brand))] transition-colors" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-4 rounded-xl bg-[rgb(var(--bg))] text-[rgb(var(--text))] border border-[rgb(var(--border-color))]/20 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))] focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors p-1 rounded-lg hover:bg-[rgb(var(--bg))]"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`p-4 rounded-xl text-sm border ${
                message.type === 'success' 
                  ? 'bg-green-500/10 border-green-500/20 text-green-600'
                  : 'bg-red-500/10 border-red-500/20 text-red-600'
              }`}>
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-[rgb(var(--brand))] to-[rgb(var(--brand))]/90 text-white rounded-xl font-semibold hover:from-[rgb(var(--brand))]/90 hover:to-[rgb(var(--brand))] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRightIcon className="w-4 h-4" />
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgb(var(--border-color))]/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[rgb(var(--panel))] text-[rgb(var(--muted))]">
                or continue with
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-4 px-6 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-xl font-medium hover:bg-[rgb(var(--bg))]/80 transition-all duration-200 border border-[rgb(var(--border-color))]/20 hover:border-[rgb(var(--border-color))]/40 flex items-center justify-center gap-3 group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Toggle Sign In/Sign Up */}
          <div className="mt-8 text-center">
            <p className="text-[rgb(var(--muted))]">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setMessage(null);
                }}
                className="text-[rgb(var(--brand))] hover:text-[rgb(var(--brand))]/80 font-semibold hover:underline transition-colors"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>

        {/* Additional Links */}
        <div className="mt-8 text-center space-y-4">
          {!isSignUp && (
            <div>
              <Link
                href="/auth/forgot-password"
                className="text-[rgb(var(--brand))] hover:text-[rgb(var(--brand))]/80 hover:underline text-sm font-medium transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          )}
          
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors text-sm"
            >
              <ArrowRightIcon className="w-4 h-4 rotate-180" />
              Back to Home
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="text-center mt-8">
          <h3 className="text-lg font-semibold mb-4">Why join Poppin?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <MagnifyingGlassIcon className="w-6 h-6 mx-auto text-[rgb(var(--muted))] mb-2" />
              <div className="font-medium text-[rgb(var(--text))]">Discover</div>
              <div className="text-[rgb(var(--muted))]">See the real happenings around town.</div>
            </div>
            <div className="text-center">
              <CalendarIcon className="w-6 h-6 mx-auto text-[rgb(var(--muted))] mb-2" />
              <div className="font-medium text-[rgb(var(--text))]">Create</div>
              <div className="text-[rgb(var(--muted))]">Post your own and get noticed.</div>
            </div>
            <div className="text-center">
              <UserGroupIcon className="w-6 h-6 mx-auto text-[rgb(var(--muted))] mb-2" />
              <div className="font-medium text-[rgb(var(--text))]">Connect</div>
              <div className="text-[rgb(var(--muted))]">Link up with people who match your vibe.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="pb-20"></div>
    </div>
  );
}
