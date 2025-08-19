'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  GlobeAltIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { tokens } from '@/components/tokens';

type FormData = {
  name: string;
  email: string;
  organization: string;
  website: string;
  bio: string;
  experience: string;
  eventTypes: string[];
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
    linkedin: string;
  };
  references: string;
  agreeToTerms: boolean;
};

export default function OrganizerApplyPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    organization: '',
    website: '',
    bio: '',
    experience: '',
    eventTypes: [],
    socialMedia: {
      instagram: '',
      facebook: '',
      twitter: '',
      linkedin: ''
    },
    references: '',
    agreeToTerms: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const eventTypeOptions = [
    'Music Events',
    'Food & Drink',
    'Nightlife',
    'Family & Kids',
    'Arts & Culture',
    'Community & Causes',
    'Education & Workshops',
    'Sports & Recreation',
    'Shopping & Sales',
    'Other'
  ];

  const steps = [
    { number: 1, title: 'Basic Information' },
    { number: 2, title: 'Organization Details' },
    { number: 3, title: 'Review & Submit' }
  ];

  function handleInputChange(field: keyof FormData, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function handleSocialMediaChange(platform: keyof FormData['socialMedia'], value: string) {
    setFormData(prev => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [platform]: value }
    }));
  }

  function handleEventTypeToggle(eventType: string) {
    setFormData(prev => ({
      ...prev,
      eventTypes: prev.eventTypes.includes(eventType)
        ? prev.eventTypes.filter(type => type !== eventType)
        : [...prev.eventTypes, eventType]
    }));
  }

  function nextStep() {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage({
        type: 'success',
        text: 'Application submitted successfully! We\'ll review your application and get back to you within 3-5 business days.'
      });
      
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        organization: '',
        website: '',
        bio: '',
        experience: '',
        eventTypes: [],
        socialMedia: {
          instagram: '',
          facebook: '',
          twitter: '',
          linkedin: ''
        },
        references: '',
        agreeToTerms: false
      });
      setCurrentStep(1);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to submit application. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  }

  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--bg))] text-[rgb(var(--text))] token-border focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--bg))] text-[rgb(var(--text))] token-border focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                Organization Name *
              </label>
              <input
                id="organization"
                type="text"
                value={formData.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--bg))] text-[rgb(var(--text))] token-border focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                placeholder="Enter your organization name"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                Website URL
              </label>
              <input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--bg))] text-[rgb(var(--text))] token-border focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                Organization Bio *
              </label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--bg))] text-[rgb(var(--text))] token-border focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                placeholder="Tell us about your organization, mission, and the types of events you host..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text))] mb-3">
                Event Types You Host *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {eventTypeOptions.map((eventType) => (
                  <label key={eventType} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.eventTypes.includes(eventType)}
                      onChange={() => handleEventTypeToggle(eventType)}
                      className="w-4 h-4 text-[rgb(var(--brand))] rounded border-[rgb(var(--muted))] focus:ring-[rgb(var(--brand))]"
                    />
                    <span className="text-sm text-[rgb(var(--text))]">{eventType}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text))] mb-3">
                Social Media Links
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  type="url"
                  value={formData.socialMedia.instagram}
                  onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                  className="px-4 py-3 rounded-lg bg-[rgb(var(--bg))] text-[rgb(var(--text))] token-border focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                  placeholder="Instagram URL"
                />
                <input
                  type="url"
                  value={formData.socialMedia.facebook}
                  onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                  className="px-4 py-3 rounded-lg bg-[rgb(var(--bg))] text-[rgb(var(--text))] token-border focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                  placeholder="Facebook URL"
                />
                <input
                  type="url"
                  value={formData.socialMedia.twitter}
                  onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                  className="px-4 py-3 rounded-lg bg-[rgb(var(--bg))] text-[rgb(var(--text))] token-border focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                  placeholder="Twitter URL"
                />
                <input
                  type="url"
                  value={formData.socialMedia.linkedin}
                  onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                  className="px-4 py-3 rounded-lg bg-[rgb(var(--bg))] text-[rgb(var(--text))] token-border focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                  placeholder="LinkedIn URL"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-[rgb(var(--bg))] rounded-lg p-4">
              <h3 className="font-medium text-[rgb(var(--text))] mb-3">Application Summary</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {formData.name}</div>
                <div><strong>Email:</strong> {formData.email}</div>
                <div><strong>Organization:</strong> {formData.organization}</div>
                <div><strong>Event Types:</strong> {formData.eventTypes.join(', ') || 'None selected'}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                className="w-4 h-4 text-[rgb(var(--brand))] rounded border-[rgb(var(--muted))] focus:ring-[rgb(var(--brand))] mt-1"
              />
              <label htmlFor="agreeToTerms" className="text-sm text-[rgb(var(--text))]">
                I agree to the{' '}
                <Link href="/terms" className="text-[rgb(var(--brand))] hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-[rgb(var(--brand))] hover:underline">
                  Privacy Policy
                </Link>
                . I confirm that all information provided is accurate and truthful.
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Become an Organizer</h1>
          <p className={`text-lg sm:text-xl ${tokens.muted}`}>
            Join our community of event organizers and reach thousands of people in your area
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-start justify-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-start">
                <div className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 ${
                    currentStep >= step.number
                      ? 'border-[rgb(var(--brand))] bg-[rgb(var(--brand))] text-white'
                      : 'border-[rgb(var(--muted))] text-[rgb(var(--muted))]'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-semibold">{step.number}</span>
                    )}
                  </div>
                  <span
                    className={`text-xs text-center mt-2 max-w-24 ${
                      currentStep === step.number ? 'text-[rgb(var(--brand))] font-medium' : 'text-[rgb(var(--muted))]'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-10 h-0.5 mx-3 self-center ${
                    currentStep > step.number ? 'bg-[rgb(var(--brand))]' : 'bg-[rgb(var(--muted))]'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-[rgb(var(--panel))] token-border rounded-2xl p-8">
          {renderStepContent()}

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

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              className="px-4 py-2 border border-[rgb(var(--border))] text-[rgb(var(--text))] rounded-xl hover:bg-[rgb(var(--panel))] transition-colors text-sm"
            >
              Previous
            </button>

            <div className="flex gap-3">
              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  className="px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-xl hover:bg-[rgb(var(--brand))]/90 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  Next
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.agreeToTerms}
                  className="px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-xl hover:bg-[rgb(var(--brand))]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[rgb(var(--text))] text-center mb-8">Benefits of Being an Organizer</h2>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center p-6 bg-[rgb(var(--panel))] token-border rounded-xl">
              <div className="w-16 h-16 bg-[rgb(var(--brand))] rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-2">
                Reach More People
              </h3>
              <p className={`text-base sm:text-lg ${tokens.muted}`}>
                Get your events in front of thousands of people actively looking for things to do in your area.
              </p>
            </div>
            
            <div className="text-center p-6 bg-[rgb(var(--panel))] token-border rounded-xl">
              <div className="w-16 h-16 bg-[rgb(var(--brand))] rounded-full flex items-center justify-center mx-auto mb-4">
                <BuildingOfficeIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-2">
                Professional Tools
              </h3>
              <p className={`text-base sm:text-lg ${tokens.muted}`}>
                Access to analytics, event management tools, and professional support to help your events succeed.
              </p>
            </div>
            
            <div className="text-center p-6 bg-[rgb(var(--panel))] token-border rounded-xl">
              <div className="w-16 h-16 bg-[rgb(var(--brand))] rounded-full flex items-center justify-center mx-auto mb-4">
                <GlobeAltIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-2">
                Build Your Brand
              </h3>
              <p className={`text-base sm:text-lg ${tokens.muted}`}>
                Establish your organization as a trusted event host and build lasting relationships with your community.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-12">
          <h2 className="text-xl md:text-2xl font-bold text-[rgb(var(--text))] mb-4">Questions About Becoming an Organizer?</h2>
          <p className={`text-base sm:text-lg ${tokens.muted} mb-6`}>
            We'll help you get rolling.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="mailto:hello@poppin.com"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 border border-[rgb(var(--border))] text-[rgb(var(--text))] text-sm font-medium hover:bg-[rgb(var(--panel))] transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="pb-20"></div>
    </div>
  );
}
