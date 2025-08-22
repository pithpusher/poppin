'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  UserIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';
import { tokens } from '@/components/tokens';

type UserRole = 'event-goer' | 'organizer';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const roles = [
    {
      id: 'event-goer' as UserRole,
      title: 'Event Goer',
      description: 'Discover and attend amazing events in your area',
      icon: UserIcon,
      features: [
        'Browse and discover events',
        'Save favorite events',
        'Follow organizers',
        'Get event recommendations',
        'Access to mobile app'
      ]
    },
    {
      id: 'organizer' as UserRole,
      title: 'Event Organizer',
      description: 'Create and manage events to reach your community',
      icon: BuildingOfficeIcon,
      features: [
        'Create and manage events',
        'Reach thousands of people',
        'Analytics and insights',
        'Professional tools',
        'Priority placement options'
      ]
    }
  ];

  async function handleSignup() {
    if (!selectedRole) {
      setMessage({ type: 'error', text: 'Please select a role to continue' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: selectedRole
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        setMessage({
          type: 'success',
          text: `Account created successfully! Check your email to verify your account. You've signed up as a ${selectedRole === 'organizer' ? 'Event Organizer' : 'Event Goer'}.`
        });

        // Clear form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setSelectedRole(null);
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to create account. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Auth
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[rgb(var(--brand))] rounded-full flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[rgb(var(--text))] mb-4">Create Your Account</h1>
          <p className={`text-lg ${tokens.muted} max-w-2xl mx-auto`}>
            Choose your role and start your journey with Poppin
          </p>
        </div>

        {/* Role Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[rgb(var(--text))] mb-4 text-center">Choose Your Role</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {roles.map((role) => (
              <div
                key={role.id}
                className={`bg-[rgb(var(--panel))] token-border rounded-xl p-6 cursor-pointer transition-all ${
                  selectedRole === role.id
                    ? 'border-[rgb(var(--brand))] bg-[rgb(var(--brand))]/5'
                    : 'hover:border-[rgb(var(--border))] hover:bg-[rgb(var(--bg))]/50'
                }`}
                onClick={() => setSelectedRole(role.id)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedRole === role.id ? 'bg-[rgb(var(--brand))]' : 'bg-[rgb(var(--bg))]'
                  }`}>
                    <role.icon className={`w-6 h-6 ${
                      selectedRole === role.id ? 'text-white' : 'text-[rgb(var(--muted))]'
                    }`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      selectedRole === role.id ? 'text-[rgb(var(--brand))]' : 'text-[rgb(var(--text))]'
                    }`}>
                      {role.title}
                    </h3>
                    <p className={`text-sm ${
                      selectedRole === role.id ? 'text-[rgb(var(--brand))]/80' : 'text-[rgb(var(--muted))]'
                    }`}>
                      {role.description}
                    </p>
                  </div>
                  {selectedRole === role.id && (
                    <CheckCircleIcon className="w-6 h-6 text-[rgb(var(--brand))] ml-auto" />
                  )}
                </div>
                <ul className="space-y-2">
                  {role.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className={selectedRole === role.id ? 'text-[rgb(var(--brand))]' : 'text-[rgb(var(--text))]'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Signup Form */}
        <div className="bg-[rgb(var(--panel))] token-border rounded-2xl p-8 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-[rgb(var(--text))] mb-6 text-center">Account Details</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--bg))] text-[rgb(var(--text))] token-border focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--bg))] text-[rgb(var(--text))] token-border focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--bg))] text-[rgb(var(--text))] token-border focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mt-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/20 text-green-600'
                : 'bg-red-500/10 border border-red-500/20 text-red-600'
            }`}>
              {message.text}
            </div>
          )}

          {/* Signup Button */}
          <button
            onClick={handleSignup}
            disabled={loading || !selectedRole || !email || !password || !confirmPassword}
            className="w-full mt-6 px-6 py-3 bg-[rgb(var(--brand))] text-white rounded-xl hover:bg-[rgb(var(--brand))]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className={`text-sm ${tokens.muted}`}>
              Already have an account?{' '}
              <Link href="/auth/sign-in" className="text-[rgb(var(--brand))] hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Role-specific next steps */}
        {selectedRole === 'organizer' && (
          <div className="mt-8 text-center">
            <div className="bg-[rgb(var(--brand))]/10 border border-[rgb(var(--brand))]/20 rounded-xl p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-[rgb(var(--brand))] mb-2">
                Next Steps for Organizers
              </h3>
              <p className={`text-sm ${tokens.muted} mb-4`}>
                After creating your account, you'll need to complete your organizer profile and choose a pricing plan.
              </p>
              <Link
                href="/organizer/apply"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors text-sm font-medium"
              >
                <BuildingOfficeIcon className="w-4 h-4" />
                Complete Organizer Setup
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
