'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircleIcon, CalendarIcon, UserIcon, SparklesIcon, FaceSmileIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function CheckoutSuccessPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Get session ID from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const session = urlParams.get('session_id');
    setSessionId(session);
  }, []);

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] py-12 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircleIcon className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold mb-4">You're In!</h1>
        <p className="text-xl text-[rgb(var(--muted))]">
          Your subscription's live and ready to go.
        </p>
      </div>

      <div className="bg-[rgb(var(--panel))] rounded-2xl p-8 max-w-2xl mx-auto mb-8">
        <div className="text-center">
          <FaceSmileIcon className="w-6 h-6 mx-auto text-[rgb(var(--muted))] mb-2" />
          <h2 className="text-2xl font-bold mb-2">All set.</h2>
          <p className="text-[rgb(var(--muted))]">
            Thanks for choosing Poppin. Your subscription is active—you can start posting right now. We just sent you a confirmation email.
          </p>
        </div>
      </div>

      <div className="bg-[rgb(var(--panel))] rounded-2xl p-8 max-w-2xl mx-auto mb-8">
        <h3 className="text-xl font-semibold mb-4 text-center">What's next?</h3>
        <div className="space-y-4">
          <Link
            href="/events/new"
            className="block w-full p-4 bg-[rgb(var(--bg))] rounded-xl hover:bg-[rgb(var(--bg))]/80 transition-colors text-center"
          >
            <CalendarIcon className="w-6 h-6 mx-auto text-[rgb(var(--muted))] mb-2" />
            <div className="font-medium">Create Your First Event</div>
            <div className="text-sm text-[rgb(var(--muted))]">Start posting and reach your community</div>
          </Link>
          <Link
            href="/account"
            className="block w-full p-4 bg-[rgb(var(--bg))] rounded-xl hover:bg-[rgb(var(--bg))]/80 transition-colors text-center"
          >
            <Cog6ToothIcon className="w-6 h-6 mx-auto text-[rgb(var(--muted))] mb-2" />
            <div className="font-medium">Manage Your Account</div>
            <div className="text-sm text-[rgb(var(--muted))]">Update settings and view analytics</div>
          </Link>
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Need a hand?</h3>
        <p className="text-[rgb(var(--muted))] mb-4">
          Our team is here to help you get started and make the most of your subscription.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="mailto:support@poppin.com"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 bg-brand text-white font-medium hover:bg-brand/90 transition-colors"
          >
            Contact Support
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 border border-[rgb(var(--border))] text-[rgb(var(--text))] font-medium hover:bg-[rgb(var(--panel))] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="pb-20"></div>
    </div>
  );
}
