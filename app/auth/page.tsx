'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRightIcon,
  SparklesIcon,
  UserPlusIcon,
  KeyIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  FaceSmileIcon,
  CalendarIcon,
  UserGroupIcon,
  LockClosedIcon,
  ShieldExclamationIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';
import { tokens } from '@/components/tokens';

export default function AuthPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--bg))] via-[rgb(var(--bg))] to-[rgb(var(--panel))] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--brand))] mx-auto"></div>
          <p className="mt-4 text-[rgb(var(--muted))]">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--bg))] via-[rgb(var(--bg))] to-[rgb(var(--panel))] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[rgb(var(--brand))] to-[rgb(var(--brand))]/80 rounded-2xl mb-4">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[rgb(var(--text))] mb-2">
              Welcome back!
            </h1>
            <p className="text-[rgb(var(--muted))]">
              You're already signed in to your account
            </p>
          </div>

          <div className="bg-[rgb(var(--panel))] backdrop-blur-sm border border-[rgb(var(--border-color))]/20 rounded-3xl p-8 shadow-2xl text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-[rgb(var(--brand))] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-2">
                {user.email}
              </h3>
              <p className="text-sm text-[rgb(var(--muted))]">
                Account verified and active
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/account"
                className="w-full py-2 px-4 bg-gradient-to-r from-[rgb(var(--brand))] to-[rgb(var(--brand))]/90 text-white rounded-xl text-sm font-medium hover:from-[rgb(var(--brand))]/90 hover:to-[rgb(var(--brand))] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Go to Account
                <ArrowRightIcon className="w-4 h-4" />
              </Link>

              <button
                onClick={signOut}
                className="w-full py-2 px-4 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-xl text-sm font-medium hover:bg-[rgb(var(--bg))]/80 transition-all duration-200 border border-[rgb(var(--border-color))]/20 hover:border-[rgb(var(--border-color))]/40"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors text-sm"
            >
              <ArrowRightIcon className="w-4 h-4 rotate-180" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--bg))] via-[rgb(var(--bg))] to-[rgb(var(--panel))] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <FaceSmileIcon className="w-16 h-16 text-[rgb(var(--brand))] mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome to Poppin</h1>
          <p className={`text-lg sm:text-xl ${tokens.muted} max-w-2xl mx-auto`}>
            Find plans, make plans, and keep the good times rolling.
          </p>
        </div>

        {/* Auth Options Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {/* Sign In */}
          <div className="bg-[rgb(var(--panel))] backdrop-blur-sm border border-[rgb(var(--border-color))]/20 rounded-2xl p-6 hover:border-[rgb(var(--border-color))]/40 transition-all duration-200 group">
            <div className="w-12 h-12 bg-[rgb(var(--brand))] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <KeyIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-[rgb(var(--text))] mb-2">
              Sign In
            </h3>
            <p className="text-[rgb(var(--muted))] mb-4">
              Access your existing account to manage events and preferences
            </p>
            <Link
              href="/auth/sign-in"
              className="inline-flex items-center gap-2 text-[rgb(var(--brand))] hover:text-[rgb(var(--brand))]/80 font-medium transition-colors"
            >
              Sign In Now
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {/* Sign Up */}
          <div className="bg-[rgb(var(--panel))] backdrop-blur-sm border border-[rgb(var(--border-color))]/20 rounded-2xl p-6 hover:border-[rgb(var(--border-color))]/40 transition-all duration-200 group">
            <div className="w-12 h-12 bg-[rgb(var(--brand))] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UserPlusIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-[rgb(var(--text))] mb-2">
              Create Account
            </h3>
            <p className="text-[rgb(var(--muted))] mb-4">
              Start your journey by creating a new account
            </p>
            <Link
              href="/auth/sign-in"
              className="inline-flex items-center gap-2 text-[rgb(var(--brand))] hover:text-[rgb(var(--brand))]/80 font-medium transition-colors"
            >
              Get Started
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {/* Magic Link */}
          <div className="bg-[rgb(var(--panel))] backdrop-blur-sm border border-[rgb(var(--border-color))]/20 rounded-2xl p-6 hover:border-[rgb(var(--border-color))]/40 transition-all duration-200 group">
            <div className="w-12 h-12 bg-[rgb(var(--brand))] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <EnvelopeIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-[rgb(var(--text))] mb-2">
              Magic Link
            </h3>
            <p className="text-[rgb(var(--muted))] mb-4">
              Sign in without a password using email magic links
            </p>
            <Link
              href="/auth/magic-link"
              className="inline-flex items-center gap-2 text-[rgb(var(--brand))] hover:text-[rgb(var(--brand))]/80 font-medium transition-colors"
            >
              Send Link
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Why Choose Poppin? */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[rgb(var(--text))] text-center mb-8">Why Choose Poppin?</h2>
          <p className={`text-base sm:text-lg ${tokens.muted} mb-6`}>Join thousands of users who are already discovering and creating amazing events</p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <FaceSmileIcon className="w-8 h-8 mx-auto text-[rgb(var(--muted))] mb-3" />
              <div className="font-medium text-[rgb(var(--text))]">Discover Great Events</div>
              <div className={`text-base sm:text-lg ${tokens.muted}`}>Concerts, classes, and hidden gems near you.</div>
            </div>
            <div className="text-center">
              <CalendarIcon className="w-8 h-8 mx-auto text-[rgb(var(--muted))] mb-3" />
              <div className="font-medium text-[rgb(var(--text))]">Create & Share</div>
              <div className={`text-base sm:text-lg ${tokens.muted}`}>Post your event and get real turnout.</div>
            </div>
            <div className="text-center">
              <UserGroupIcon className="w-8 h-8 mx-auto text-[rgb(var(--muted))] mb-3" />
              <div className="font-medium text-[rgb(var(--text))]">Connect & Network</div>
              <div className={`text-base sm:text-lg ${tokens.muted}`}>Find your crew, expand your circle.</div>
            </div>
          </div>
        </div>

        {/* Safe & Solid */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[rgb(var(--text))] text-center mb-8">Safe & Solid</h2>
          <p className={`text-base sm:text-lg ${tokens.muted} mb-6`}>
            Your info stays locked down with top-grade security.
          </p>
          <div className="flex justify-center gap-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgb(var(--panel))] text-sm">
              <LockClosedIcon className="w-4 h-4" /> Encrypted
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgb(var(--panel))] text-sm">
              <ShieldExclamationIcon className="w-4 h-4" /> Privacy first
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgb(var(--panel))] text-sm">
              <CheckBadgeIcon className="w-4 h-4" /> GDPR ready
            </span>
          </div>
        </div>

        {/* Got Questions? */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[rgb(var(--text))] text-center mb-8">Got Questions?</h2>
          <p className={`text-base sm:text-lg ${tokens.muted} max-w-2xl mx-auto`}>
            Everything you need to know about our pricing and plans
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-sm text-[rgb(var(--muted))]">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-5">
              <h3 className="font-semibold mb-2">What happens if I exceed my event limit?</h3>
              <p className="text-sm text-[rgb(var(--muted))]">
                You'll be notified when you're close to your limit. Upgrade anytime to post more events.
              </p>
            </div>
            
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-sm text-[rgb(var(--muted))]">
                We offer a 30-day money-back guarantee. If you're not satisfied, we'll refund your subscription.
              </p>
            </div>
            
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Is there a setup fee?</h3>
              <p className="text-sm text-[rgb(var(--muted))]">
                No setup fees! Just pay your monthly subscription and start posting events immediately.
              </p>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link
              href="mailto:sales@poppin.com"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-xl text-sm font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>

        {/* Ready to roll? */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[rgb(var(--text))] mb-4">Ready to roll?</h2>
          <p className={`text-base sm:text-lg ${tokens.muted} mb-6`}>
            Join the locals already finding and sharing what's poppin.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/sign-in"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
            >
              Sign Up
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 border border-[rgb(var(--border))] text-[rgb(var(--text))] text-sm font-medium hover:bg-[rgb(var(--panel))] transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors text-sm"
          >
            <ArrowRightIcon className="w-4 h-4 rotate-180" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="pb-20"></div>
    </div>
  );
}
