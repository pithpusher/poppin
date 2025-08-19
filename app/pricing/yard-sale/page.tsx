'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  TagIcon, 
  CalendarIcon, 
  MapPinIcon, 
  CheckIcon, 
  StarIcon,
  ArrowLeftIcon,
  BoltIcon,
  ChartBarIcon,
  HandRaisedIcon,
  CursorArrowRaysIcon
} from '@heroicons/react/24/outline';
import { tokens } from '@/components/tokens';

export default function YardSalePage() {
  const [selectedPlan, setSelectedPlan] = useState<'single' | 'bundle'>('single');

  const plans = [
    {
      name: 'Single Event Post',
      price: '$5',
      description: 'Drop in once, no strings.',
      features: [
        'One event post',
        '30 days visibility',
        'Basic analytics',
        'Social sharing tools'
      ]
    },
    {
      name: 'Event Bundle',
      price: '$12',
      description: 'Stack a few and save.',
      features: [
        '3 event posts',
        '60 days visibility each',
        'Enhanced analytics',
        'Priority placement',
        'Email support'
      ]
    }
  ];

  const benefits = [
    {
      icon: CursorArrowRaysIcon,
      title: 'Reach Your Neighbors',
      description: 'Put your event in front of locals actually looking.'
    },
    {
      icon: BoltIcon,
      title: 'Easy Setup',
      description: 'Post, edit, track. All in one simple dashboard.'
    },
    {
      icon: ChartBarIcon,
      title: 'See the Results',
      description: 'Views, saves, shares—it\'s all there.'
    },
    {
      icon: HandRaisedIcon,
      title: 'No Strings Attached',
      description: 'Pay once, done. No subs, no stress.'
    }
  ];

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] py-8 md:py-12 lg:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6 md:mb-8 lg:mb-10">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-all duration-200 hover:scale-105"
          >
            <ArrowLeftIcon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
            <span className="text-sm md:text-base lg:text-lg">Back to Pricing</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-3 lg:px-6 lg:py-4 bg-[rgb(var(--brand))] text-white rounded-full text-xs md:text-sm lg:text-base font-medium mb-4 md:mb-6 lg:mb-8">
            <TagIcon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
            One-Time Event Posts
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6 lg:mb-8">One-off Posting</h1>
          <p className={`text-base sm:text-lg md:text-xl lg:text-2xl ${tokens.muted} max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto`}>
            Perfect for yard sales, garage cleanouts, or one-time events.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:gap-10 lg:gap-12 md:grid-cols-2 mb-16 md:mb-20 lg:mb-24">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className="bg-[rgb(var(--panel))] token-border rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 text-center"
            >
              <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-[rgb(var(--text))] mb-2 md:mb-3">{plan.name}</h3>
              <div className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[rgb(var(--brand))] mb-2 md:mb-3">{plan.price}</div>
              <p className={`text-base sm:text-lg md:text-xl lg:text-2xl ${tokens.muted} mb-6 md:mb-8`}>{plan.description}</p>
              
              <ul className="space-y-2 md:space-y-3 lg:space-y-4 mb-6 md:mb-8 text-left">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 md:gap-3">
                    <CheckIcon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-green-500 flex-shrink-0" />
                    <span className="text-xs md:text-sm lg:text-base text-[rgb(var(--text))]">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className="w-full px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 bg-[rgb(var(--brand))] text-white rounded-xl md:rounded-2xl hover:bg-[rgb(var(--brand))]/90 transition-all duration-200 hover:scale-105 text-sm md:text-base lg:text-lg font-medium">
                Get Started
              </button>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mb-16 md:mb-20 lg:mb-24">
          <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-[rgb(var(--text))] text-center mb-8 md:mb-10 lg:mb-12">Why Use Yard Sale Pricing?</h2>
          <div className="grid gap-6 md:gap-8 lg:gap-10 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-[rgb(var(--brand))]/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 lg:mb-6">
                  <benefit.icon className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-[rgb(var(--brand))]" />
                </div>
                <h3 className="text-base md:text-lg lg:text-xl xl:text-2xl font-semibold text-[rgb(var(--text))] mb-2 md:mb-3">{benefit.title}</h3>
                <p className={`text-xs md:text-sm lg:text-base ${tokens.muted}`}>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16 md:mb-20 lg:mb-24">
          <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-[rgb(var(--text))] text-center mb-8 md:mb-10 lg:mb-12">Quick & Simple</h2>
          <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8 md:mb-10 lg:mb-12">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-[rgb(var(--brand))] text-white rounded-full flex items-center justify-center text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3">1</div>
                <span className="text-xs md:text-sm lg:text-base text-[rgb(var(--text))] text-center">Post Event</span>
              </div>
              <div className="flex-1 h-0.5 md:h-1 bg-[rgb(var(--border-color))]/20 mx-4 md:mx-6 lg:mx-8"></div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-[rgb(var(--brand))] text-white rounded-full flex items-center justify-center text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3">2</div>
                <span className="text-xs md:text-sm lg:text-base text-[rgb(var(--text))] text-center">Get Views</span>
              </div>
              <div className="flex-1 h-0.5 md:h-1 bg-[rgb(var(--border-color))]/20 mx-4 md:mx-6 lg:mx-8"></div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-[rgb(var(--brand))] text-white rounded-full flex items-center justify-center text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3">3</div>
                <span className="text-xs md:text-sm lg:text-base text-[rgb(var(--text))] text-center">See Results</span>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16 md:mb-20 lg:mb-24">
          <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6 lg:mb-8 text-center">Common Questions</h2>
          <p className="text-[rgb(var(--muted))] md:text-lg lg:text-xl max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto text-center mb-8 md:mb-10 lg:mb-12">
            Everything you need to know about one-off event posting
          </p>
          
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 lg:space-y-10">
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl md:rounded-2xl lg:rounded-3xl p-6 md:p-8 lg:p-10">
              <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold text-[rgb(var(--text))] mb-2 md:mb-3">
                How long do my event posts stay active?
              </h3>
              <p className="text-[rgb(var(--muted))] md:text-base lg:text-lg">
                Single event posts are active for 30 days, while bundle posts are active for 90 days. 
                You can extend them anytime for a small fee.
              </p>
            </div>
            
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl md:rounded-2xl lg:rounded-3xl p-6 md:p-8 lg:p-10">
              <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold text-[rgb(var(--text))] mb-2 md:mb-3">
                Can I edit my events after posting?
              </h3>
              <p className="text-[rgb(var(--muted))] md:text-base lg:text-lg">
                Yes! You can edit your events anytime during their active period. Changes are reflected immediately.
              </p>
            </div>
            
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl md:rounded-2xl lg:rounded-3xl p-6 md:p-8 lg:p-10">
              <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold text-[rgb(var(--text))] mb-2 md:mb-3">
                What if I need more than 3 events?
              </h3>
              <p className="text-[rgb(var(--muted))] md:text-base lg:text-lg">
                You can purchase additional single posts or upgrade to a subscription plan for unlimited events.
              </p>
            </div>
            
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl md:rounded-2xl lg:rounded-3xl p-6 md:p-8 lg:p-10">
              <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold text-[rgb(var(--text))] mb-2 md:mb-3">
                Is there a refund policy?
              </h3>
              <p className="text-[rgb(var(--muted))] md:text-base lg:text-lg">
                We offer a 7-day money-back guarantee if you're not satisfied with our service.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-[rgb(var(--text))] mb-4 md:mb-6 lg:mb-8">Ready to post your event?</h2>
          <p className={`text-base sm:text-lg md:text-xl lg:text-2xl ${tokens.muted} max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto mb-6 md:mb-8 lg:mb-10`}>
            Get started in minutes and reach your local community today.
          </p>
          <button className="px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 bg-[rgb(var(--brand))] text-white rounded-xl md:rounded-2xl hover:bg-[rgb(var(--brand))]/90 transition-all duration-200 hover:scale-105 text-sm md:text-base lg:text-lg font-medium">
            Get Started
          </button>
        </div>

        {/* Comparison with Subscription */}
        <div className="text-center mt-16 md:mt-20 lg:mt-24">
          <p className="text-[rgb(var(--muted))] md:text-lg lg:text-xl mb-4 md:mb-6">
            Need to post events regularly?
          </p>
          <Link
            href="/pricing"
            className="text-[rgb(var(--brand))] hover:underline font-medium text-base md:text-lg lg:text-xl transition-all duration-200 hover:scale-105"
          >
            Check out our subscription plans →
          </Link>
        </div>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="pb-20"></div>
    </div>
  );
}
