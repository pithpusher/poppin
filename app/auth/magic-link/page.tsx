'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  EnvelopeIcon,
  ArrowRightIcon,
  SparklesIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';
import { tokens } from '@/components/tokens';

export default function MagicLinkPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      setEmailSent(true);
      setMessage({
        type: 'success',
        text: 'Magic link sent! Check your email and click the link to sign in.'
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to send magic link. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] py-12 px-4">
      <div className="w-full max-w-md mx-auto">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[rgb(var(--brand))] rounded-2xl mb-4">
            <SparklesIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[rgb(var(--text))] mb-4">Magic Link</h1>
          <p className={`text-lg sm:text-xl ${tokens.muted}`}>
            Sign in without a password
          </p>
        </div>

        {/* Magic Link Form */}
        <div className="bg-[rgb(var(--panel))] token-border rounded-3xl p-8 shadow-2xl">
          {!emailSent ? (
            <>
              <div className="text-center mb-6">
                <EnvelopeIcon className="w-12 h-12 text-[rgb(var(--brand))] mx-auto mb-4" />
                <p className={`text-[rgb(var(--muted)] mb-6`}>
                  Enter your email address and we'll send you a secure link to sign in instantly.
                </p>
              </div>

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
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-[rgb(var(--bg))] text-[rgb(var(--text))] token-border focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))] focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email"
                    />
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
                  className="w-full py-2 px-4 bg-[rgb(var(--brand))] text-white rounded-xl text-sm font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending Magic Link...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      Send Magic Link
                      <ArrowRightIcon className="w-4 h-4" />
                    </div>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-[rgb(var(--text))] mb-3">
                Check Your Email
              </h3>
              <p className={`text-[rgb(var(--muted)] mb-6`}>
                We've sent a magic link to <strong>{email}</strong>. Click the link in your email to sign in instantly.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setMessage(null);
                    setEmail('');
                  }}
                  className="w-full py-2 px-4 bg-[rgb(var(--brand))] text-white rounded-xl text-sm font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors"
                >
                  Send Another Link
                </button>
                <Link
                  href="/auth/sign-in"
                  className="block w-full py-2 px-4 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-xl text-sm font-medium hover:bg-[rgb(var(--panel))] transition-colors border border-[rgb(var(--border-color))]"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Additional Links */}
        <div className="mt-8 text-center space-y-4">
          <div>
            <Link
              href="/auth/sign-in"
              className="text-[rgb(var(--brand))] hover:text-[rgb(var(--brand))]/80 hover:underline text-sm font-medium transition-colors"
            >
              Prefer to use a password?
            </Link>
          </div>
          
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

        {/* Benefits */}
        <div className="text-center mt-8">
          <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Why Magic Links?</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="text-center">
              <div className="w-8 h-8 bg-[rgb(var(--brand))] rounded-lg flex items-center justify-center mx-auto mb-2">
                <CheckIcon className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-[rgb(var(--text))]">No Passwords to Remember</div>
              <div className={`text-[rgb(var(--muted))] text-sm`}>Sign in securely without managing passwords.</div>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-[rgb(var(--brand))] rounded-lg flex items-center justify-center mx-auto mb-2">
                <CheckIcon className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-[rgb(var(--text))]">Enhanced Security</div>
              <div className={`text-[rgb(var(--muted))] text-sm`}>Each link is unique and expires quickly.</div>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-[rgb(var(--brand))] rounded-lg flex items-center justify-center mx-auto mb-2">
                <CheckIcon className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-[rgb(var(--text))]">Instant Access</div>
              <div className={`text-[rgb(var(--muted))] text-sm`}>Click the link and you're signed in.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="h-16 sm:h-0"></div>
      <div className="pb-12 sm:pb-0"></div>
    </div>
  );
}
