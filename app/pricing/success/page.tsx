'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircleIcon, CalendarIcon, UserIcon, SparklesIcon, FaceSmileIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { tokens } from '@/components/tokens';

export default function CheckoutSuccessPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Get session ID from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const session = urlParams.get('session_id');
    setSessionId(session);
  }, []);

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] py-12 md:py-16 lg:py-20 px-4">
      <div className="text-center mb-8 md:mb-12 lg:mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-green-100 rounded-full mb-6 md:mb-8 lg:mb-10">
          <CheckCircleIcon className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 text-green-600" />
        </div>
        <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 md:mb-6 lg:mb-8">You're In!</h1>
        <p className={`text-base sm:text-lg md:text-xl lg:text-2xl ${tokens.muted}`}>
          Your subscription's live and ready to go.
        </p>
      </div>

      <div className="bg-[rgb(var(--panel))] rounded-2xl md:rounded-3xl p-8 md:p-10 lg:p-12 max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto mb-8 md:mb-12 lg:mb-16">
        <div className="text-center">
          <FaceSmileIcon className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 mx-auto text-[rgb(var(--muted))] mb-2 md:mb-3" />
          <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-2 md:mb-3">All set.</h2>
          <p className={`text-base sm:text-lg md:text-xl lg:text-2xl ${tokens.muted}`}>
            Thanks for choosing Poppin. Your subscription is active—you can start posting right now. We just sent you a confirmation email.
          </p>
        </div>
      </div>

      <div className="bg-[rgb(var(--panel))] rounded-2xl md:rounded-3xl p-8 md:p-10 lg:p-12 max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto mb-8 md:mb-12 lg:mb-16">
        <h3 className="text-base md:text-lg lg:text-xl xl:text-2xl font-semibold mb-4 md:mb-6 lg:mb-8 text-center">What's next?</h3>
        <div className="space-y-4 md:space-y-6 lg:space-y-8">
          <Link
            href="/events/new"
            className="block w-full p-4 md:p-6 lg:p-8 bg-[rgb(var(--bg))] rounded-xl md:rounded-2xl hover:bg-[rgb(var(--bg))]/80 transition-all duration-200 hover:scale-105 text-center"
          >
            <CalendarIcon className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 mx-auto text-[rgb(var(--muted))] mb-2 md:mb-3" />
            <div className="font-medium text-base md:text-lg lg:text-xl">Create Your First Event</div>
            <div className="text-sm md:text-base lg:text-lg text-[rgb(var(--muted))]">Start posting and reach your community</div>
          </Link>
          <Link
            href="/account"
            className="block w-full p-4 md:p-6 lg:p-8 bg-[rgb(var(--bg))] rounded-xl md:rounded-2xl hover:bg-[rgb(var(--bg))]/80 transition-all duration-200 hover:scale-105 text-center"
          >
            <Cog6ToothIcon className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 mx-auto text-[rgb(var(--muted))] mb-2 md:mb-3" />
            <div className="font-medium text-base md:text-lg lg:text-xl">Manage Your Account</div>
            <div className="text-sm md:text-base lg:text-lg text-[rgb(var(--muted))]">Update settings and view analytics</div>
          </Link>
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold mb-4 md:mb-6 lg:mb-8">Need a hand?</h3>
        <p className="text-[rgb(var(--muted))] md:text-lg lg:text-xl mb-4 md:mb-6 lg:mb-8 max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto">
          Our team is here to help you get started and make the most of your subscription.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 lg:gap-6 justify-center">
          <Link
            href="mailto:support@poppin.com"
            className="inline-flex items-center justify-center rounded-xl md:rounded-2xl px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 bg-brand text-white text-sm md:text-base lg:text-lg font-medium hover:bg-brand/90 transition-all duration-200 hover:scale-105"
          >
            Contact Support
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl md:rounded-2xl px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 border border-[rgb(var(--border))] text-[rgb(var(--text))] text-sm md:text-base lg:text-lg font-medium hover:bg-[rgb(var(--panel))] transition-all duration-200 hover:scale-105"
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
