'use client';

import Link from 'next/link';
import { XCircleIcon, ArrowLeftIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export default function CheckoutCancelledPage() {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] py-12 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <XCircleIcon className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Payment Cancelled</h1>
        <p className="text-xl text-[rgb(var(--muted))]">
          Looks like it didn't go through.
        </p>
      </div>

      <div className="bg-[rgb(var(--panel))] rounded-2xl p-8 max-w-2xl mx-auto mb-8">
        <div className="text-center">
          <div className="text-2xl mb-2">💳</div>
          <h2 className="text-2xl font-bold mb-2">No charges made.</h2>
          <p className="text-[rgb(var(--muted))]">
            You're good—nothing was processed. Try again anytime or hit us up if you need help.
          </p>
        </div>
      </div>

      <div className="bg-[rgb(var(--panel))] rounded-2xl p-8 max-w-2xl mx-auto mb-8">
        <h3 className="text-xl font-semibold mb-4 text-center">Common reasons for cancellation:</h3>
        <div className="space-y-3 text-left">
          <div className="flex items-start gap-3">
            <div className="text-red-500 mt-1">•</div>
            <div>
              <div className="font-medium">Changed your mind</div>
              <div className="text-sm text-[rgb(var(--muted))]">No worries, you can always come back later</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-red-500 mt-1">•</div>
            <div>
              <div className="font-medium">Technical issues</div>
              <div className="text-sm text-[rgb(var(--muted))]">Sometimes things get glitchy</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-red-500 mt-1">•</div>
            <div>
              <div className="font-medium">Need more info</div>
              <div className="text-sm text-[rgb(var(--muted))]">Want to learn more before committing</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Ready to try again?</h3>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 bg-brand text-white font-medium hover:bg-brand/90 transition-colors"
          >
            View Plans Again
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 border border-[rgb(var(--border))] text-[rgb(var(--text))] font-medium hover:bg-[rgb(var(--panel))] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <p className="text-[rgb(var(--muted))] mb-4">
            Need help or have questions?
          </p>
          <div className="flex gap-4 justify-center text-sm">
            <Link
              href="/auth"
              className="text-[rgb(var(--brand))] hover:underline"
            >
              Contact Support
            </Link>
            <span className="text-[rgb(var(--muted))]">•</span>
            <Link
              href="/organizer/apply"
              className="text-[rgb(var(--brand))] hover:underline"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Back to Pricing */}
        <div className="mt-8">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Return to Pricing
          </Link>
        </div>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="pb-20"></div>
    </div>
  );
}
