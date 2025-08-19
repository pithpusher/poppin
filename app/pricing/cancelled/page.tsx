'use client';

import Link from 'next/link';
import { XCircleIcon, ArrowLeftIcon, QuestionMarkCircleIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { tokens } from '@/components/tokens';

export default function CheckoutCancelledPage() {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] py-12 md:py-16 lg:py-20 px-4">
      <div className="text-center mb-8 md:mb-12 lg:mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-red-100 rounded-full mb-6 md:mb-8 lg:mb-10">
          <XCircleIcon className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 text-red-600" />
        </div>
        <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 md:mb-6 lg:mb-8">Payment Cancelled</h1>
        <p className={`text-base sm:text-lg md:text-xl lg:text-2xl ${tokens.muted}`}>
          Looks like it didn't go through.
        </p>
      </div>

      <div className="bg-[rgb(var(--panel))] rounded-2xl md:rounded-3xl p-8 md:p-10 lg:p-12 max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto mb-8 md:mb-12 lg:mb-16">
        <div className="text-center">
          <CreditCardIcon className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 mx-auto text-[rgb(var(--muted))] mb-2 md:mb-3" />
          <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-2 md:mb-3">No charges made.</h2>
          <p className={`text-base sm:text-lg md:text-xl lg:text-2xl ${tokens.muted}`}>
            You're good—nothing was processed. Try again anytime or hit us up if you need help.
          </p>
        </div>
      </div>

      <div className="bg-[rgb(var(--panel))] rounded-2xl md:rounded-3xl p-8 md:p-10 lg:p-12 max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto mb-8 md:mb-12 lg:mb-16">
        <h3 className="text-base md:text-lg lg:text-xl xl:text-2xl font-semibold mb-4 md:mb-6 lg:mb-8 text-center">Common reasons for cancellation:</h3>
        <div className="space-y-3 md:space-y-4 lg:space-y-6 text-left">
          <div className="flex items-start gap-3 md:gap-4">
            <div className="text-red-500 mt-1 text-lg md:text-xl lg:text-2xl">•</div>
            <div>
              <div className="font-medium text-base md:text-lg lg:text-xl">Changed your mind</div>
              <div className="text-sm md:text-base lg:text-lg text-[rgb(var(--muted))]">No worries, you can always come back later</div>
            </div>
          </div>
          <div className="flex items-start gap-3 md:gap-4">
            <div className="text-red-500 mt-1 text-lg md:text-xl lg:text-2xl">•</div>
            <div>
              <div className="font-medium text-base md:text-lg lg:text-xl">Technical issues</div>
              <div className="text-sm md:text-base lg:text-lg text-[rgb(var(--muted))]">Sometimes things get glitchy</div>
            </div>
          </div>
          <div className="flex items-start gap-3 md:gap-4">
            <div className="text-red-500 mt-1 text-lg md:text-xl lg:text-2xl">•</div>
            <div>
              <div className="font-medium text-base md:text-lg lg:text-xl">Need more info</div>
              <div className="text-sm md:text-base lg:text-lg text-[rgb(var(--muted))]">Want to learn more before committing</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold mb-4 md:mb-6 lg:mb-8">Ready to try again?</h3>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 lg:gap-6 justify-center">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-xl md:rounded-2xl px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 bg-brand text-white text-sm md:text-base lg:text-lg font-medium hover:bg-brand/90 transition-all duration-200 hover:scale-105"
          >
            View Plans Again
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl md:rounded-2xl px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 border border-[rgb(var(--border))] text-[rgb(var(--text))] text-sm md:text-base lg:text-lg font-medium hover:bg-[rgb(var(--panel))] transition-all duration-200 hover:scale-105"
          >
            Back to Home
          </Link>
        </div>
      </div>

      <div className="bg-[rgb(var(--panel))] rounded-2xl md:rounded-3xl p-8 md:p-10 lg:p-12 max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto mb-8 md:mb-12 lg:mb-16">
        {/* Help Section */}
        <div className="mt-12 md:mt-16 lg:mt-20 text-center">
          <p className="text-[rgb(var(--muted))] md:text-lg lg:text-xl mb-4 md:mb-6">
            Need help or have questions?
          </p>
          <div className="flex gap-4 md:gap-6 lg:gap-8 justify-center text-sm md:text-base lg:text-lg">
            <Link
              href="/auth"
              className="text-[rgb(var(--brand))] hover:underline transition-all duration-200 hover:scale-105"
            >
              Contact Support
            </Link>
            <span className="text-[rgb(var(--muted))]">•</span>
            <Link
              href="/organizer/apply"
              className="text-[rgb(var(--brand))] hover:underline transition-all duration-200 hover:scale-105"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Back to Pricing */}
        <div className="mt-8 md:mt-10 lg:mt-12">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-all duration-200 hover:scale-105"
          >
            <ArrowLeftIcon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
            <span className="text-sm md:text-base lg:text-lg">Return to Pricing</span>
          </Link>
        </div>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="pb-20"></div>
    </div>
  );
}
