'use client';

import React, { useState, useEffect } from 'react';
import { 
  StarIcon, 
  UserIcon, 
  CalendarIcon,
  HandThumbUpIcon,
  ChatBubbleLeftIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface EventReviewsProps {
  eventId: string;
  eventTitle: string;
  className?: string;
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  review: string;
  date: string;
  helpful: number;
  verified: boolean;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export default function EventReviews({ eventId, eventTitle, className = "" }: EventReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {}
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    review: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');

  // Mock reviews data - in production this would come from an API
  useEffect(() => {
    const mockReviews: Review[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'Sarah Johnson',
        rating: 5,
        review: 'Absolutely amazing event! The atmosphere was incredible and the music was fantastic. Can\'t wait for the next one!',
        date: '2024-07-16',
        helpful: 12,
        verified: true
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Mike Chen',
        rating: 4,
        review: 'Great experience overall. The venue was perfect and the organizers did a fantastic job. Would definitely recommend!',
        date: '2024-07-15',
        helpful: 8,
        verified: true
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'Emily Rodriguez',
        rating: 5,
        review: 'This was my first time attending and I was blown away! The energy was incredible and I met so many amazing people.',
        date: '2024-07-14',
        helpful: 15,
        verified: false
      },
      {
        id: '4',
        userId: 'user4',
        userName: 'David Kim',
        rating: 3,
        review: 'Good event but could have been better organized. The line to get in was quite long.',
        date: '2024-07-13',
        helpful: 3,
        verified: true
      }
    ];

    const stats: ReviewStats = {
      averageRating: mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length,
      totalReviews: mockReviews.length,
      ratingDistribution: mockReviews.reduce((acc, r) => {
        acc[r.rating] = (acc[r.rating] || 0) + 1;
        return acc;
      }, {} as Record<number, number>)
    };

    setReviews(mockReviews);
    setReviewStats(stats);
  }, [eventId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubmitReview = async () => {
    if (!newReview.review.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const review: Review = {
      id: `review_${Date.now()}`,
      userId: 'currentUser',
      userName: 'You',
      rating: newReview.rating,
      review: newReview.review,
      date: new Date().toISOString().split('T')[0],
      helpful: 0,
      verified: true
    };

    setReviews(prev => [review, ...prev]);
    setNewReview({ rating: 5, review: '' });
    setShowReviewForm(false);
    setIsSubmitting(false);
  };

  const handleHelpful = (reviewId: string) => {
    setReviews(prev => 
      prev.map(r => 
        r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
      )
    );
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'helpful':
        return b.helpful - a.helpful;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <div className={cn("bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20", className)}>
      {/* Header */}
      <div className="p-6 border-b border-[rgb(var(--border-color))]/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[rgb(var(--text))] flex items-center gap-2">
              <StarIcon className="w-6 h-6 text-yellow-500" />
              Reviews & Ratings
            </h2>
            <p className="text-[rgb(var(--muted))] mt-1">
              {reviewStats.totalReviews} reviews for {eventTitle}
            </p>
          </div>
          
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors"
          >
            Write a Review
          </button>
        </div>
      </div>

      {/* Review Stats */}
      <div className="p-6 border-b border-[rgb(var(--border-color))]/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-600 mb-2">
              {reviewStats.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={cn(
                    "w-5 h-5",
                    i < Math.round(reviewStats.averageRating) ? "text-yellow-500 fill-current" : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <div className="text-sm text-[rgb(var(--muted))]">
              {reviewStats.totalReviews} reviews
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-3">Rating Breakdown</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviewStats.ratingDistribution[rating] || 0;
                const percentage = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm text-[rgb(var(--text))]">{rating}</span>
                      <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                    </div>
                    <div className="flex-1 bg-[rgb(var(--bg))] rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-right">
                      <span className="text-sm text-[rgb(var(--muted))]">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="px-6 pt-4">
        <div className="flex items-center justify-between border-b border-[rgb(var(--border-color))]/20">
          <div className="flex items-center gap-4">
            <span className="text-sm text-[rgb(var(--muted))]">Sort by:</span>
            {[
              { id: 'recent', label: 'Most Recent' },
              { id: 'helpful', label: 'Most Helpful' },
              { id: 'rating', label: 'Highest Rated' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setSortBy(option.id as any)}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-t-lg transition-colors",
                  sortBy === option.id
                    ? "text-[rgb(var(--brand))] border-b-2 border-[rgb(var(--brand))]"
                    : "text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="p-6">
        <div className="space-y-6">
          {sortedReviews.map((review) => (
            <div key={review.id} className="border border-[rgb(var(--border-color))]/20 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[rgb(var(--muted))] rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-[rgb(var(--text))]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[rgb(var(--text))]">{review.userName}</span>
                      {review.verified && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted))]">
                      <CalendarIcon className="w-3 h-3" />
                      {formatDate(review.date)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < review.rating ? "text-yellow-500 fill-current" : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-[rgb(var(--text))] mb-3">{review.review}</p>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleHelpful(review.id)}
                  className="flex items-center gap-2 text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
                >
                                          <HandThumbUpIcon className="w-4 h-4" />
                  Helpful ({review.helpful})
                </button>
                <button className="flex items-center gap-2 text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors">
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[rgb(var(--panel))] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))]">Write a Review</h3>
              <button
                onClick={() => setShowReviewForm(false)}
                className="text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                  Your Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <StarIcon
                        className={cn(
                          "w-8 h-8",
                          rating <= newReview.rating ? "text-yellow-500 fill-current" : "text-gray-300"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                  Your Review
                </label>
                <textarea
                  value={newReview.review}
                  onChange={(e) => setNewReview(prev => ({ ...prev, review: e.target.value }))}
                  placeholder="Share your experience with this event..."
                  rows={4}
                  className="w-full px-3 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg border border-[rgb(var(--border-color))]/20 focus:ring-2 focus:ring-[rgb(var(--brand))]/50 focus:ring-offset-2 focus:outline-none resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="flex-1 px-4 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg border border-[rgb(var(--border-color))]/20 hover:bg-[rgb(var(--bg))]/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={!newReview.review.trim() || isSubmitting}
                  className="flex-1 px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="w-4 h-4" />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
