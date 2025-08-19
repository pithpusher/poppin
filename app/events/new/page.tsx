"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toCents, formatMoneyFromCents } from "@/lib/money";
import { forwardGeocode, GeocodeResult } from "@/lib/geocode";
import { generateEventDescription } from "@/lib/ai";
import { searchVenues, VenueSearchResult } from "@/lib/googlePlaces";
import { tokens } from "@/components/tokens";

import { PhotoIcon, XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

// Event type categories mapping
const eventTypeCategories = {
  "Music": ["Rock", "Hip-Hop / Rap", "EDM / Dance", "Country", "Jazz / Blues", "Pop", "Classical / Orchestra", "Open Mic / Jam"],
  "Food & Drink": ["Food Trucks", "Wine / Beer Festivals", "Pop-up Dining"],
  "Nightlife": ["Clubs / DJ Sets", "Bar Specials", "Karaoke"],
  "Family & Kids": ["Storytime / Library", "Festivals / Fairs", "Sports / Rec"],
  "Arts & Culture": ["Theatre / Plays", "Art Exhibits", "Comedy", "Film / Screenings"],
  "Community & Causes": ["Markets / Craft Fairs", "Charity / Fundraisers", "Civic / Town Hall"],
  "Education & Workshops": ["Business / Networking", "Classes & Seminars", "Tech & Startup Events"],
  "Sports & Recreation": ["Games / Tournaments", "Races / Fun Runs", "Outdoor Adventures"],
  "Shopping & Sales": ["Store Sales / Clearance", "Flea Markets", "Grand Openings"]
};

interface DateEntry {
  id: string;
  start_at: string;
  end_at: string;
}

interface FormData {
  title: string;
  description: string;
  dateEntries: DateEntry[];
  category: string;
  event_type: string;
  venue_name: string;
  venue_address: string;
  price_cents: number;
  registration_url: string;
  image_url: string;
  website_url: string;
  social_links: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  dateEntries?: string;
  category?: string;
  event_type?: string;
  venue_name?: string;
  venue_address?: string;
  price_cents?: string;
  registration_url?: string;
  image_url?: string;
  website_url?: string;
  social_links?: string;
}

export default function NewEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<VenueSearchResult[]>([]);
  const [geocodeResult, setGeocodeResult] = useState<GeocodeResult | null>(null);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    dateEntries: [{ id: '1', start_at: '', end_at: '' }],
    category: "",
    event_type: "",
    venue_name: "",
    venue_address: "",
    price_cents: 0,
    registration_url: "",
    image_url: "",
    website_url: "",
    social_links: "",
  });

  // Load form data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('newEventForm');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
      } catch {
        console.error('Failed to parse saved form data');
      }
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('newEventForm', JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Save to localStorage
    const updated = { ...prev, [field]: value };
    localStorage.setItem('newEventForm', JSON.stringify(updated));
  };

  const handleDateEntryChange = (id: string, field: 'start_at' | 'end_at', value: string) => {
    setFormData(prev => ({
      ...prev,
      dateEntries: prev.dateEntries.map(entry => 
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    }));
    
    // Save to localStorage
    const updated = {
      ...prev,
      dateEntries: prev.dateEntries.map(entry => 
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    };
    localStorage.setItem('newEventForm', JSON.stringify(updated));
  };

  const addDateEntry = () => {
    const newId = (formData.dateEntries.length + 1).toString();
    const newEntry = { id: newId, start_at: '', end_at: '' };
    setFormData(prev => ({
      ...prev,
      dateEntries: [...prev.dateEntries, newEntry]
    }));
    
    // Save to localStorage
    const updated = { ...formData, dateEntries: [...formData.dateEntries, newEntry] };
    localStorage.setItem('newEventForm', JSON.stringify(updated));
  };

  const removeDateEntry = (id: string) => {
    if (formData.dateEntries.length > 1) {
      setFormData(prev => ({
        ...prev,
        dateEntries: prev.dateEntries.filter(entry => entry.id !== id)
      }));
      
      // Save to localStorage
      const updated = { ...formData, dateEntries: formData.dateEntries.filter(entry => entry.id !== id) };
      localStorage.setItem('newEventForm', JSON.stringify(updated));
    }
  };

  const validateDateRange = (start: string, end: string): boolean => {
    if (!start || !end) return false;
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const now = new Date();
    
    // Check if dates are in the future
    if (startDate <= now) return false;
    
    // Check if end is after start
    if (endDate <= startDate) return false;
    
    // Check if within 1 week
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (startDate > oneWeekFromNow) return false;
    
    return true;
  };

  const handleAddressBlur = async () => {
    if (!formData.venue_address.trim()) return;
    
    setIsGeocoding(true);
    setGeocodeError(null);
    
    try {
      const result = await forwardGeocode(formData.venue_address);
      setGeocodeResult(result);
      setGeocodeError(null);
    } catch (error) {
      console.error('Geocoding error:', error);
      setGeocodeError('Could not find this address. Please check and try again.');
      setGeocodeResult(null);
    } finally {
      setIsGeocoding(false);
    }
  };

  const generateAIDescription = async () => {
    const { title, category, event_type, venue_name } = formData;
    
    if (!title || !category || !event_type) {
      alert('Please fill in title, category, and event type first');
      return;
    }
    
    setIsGeneratingAI(true);
    
    try {
      const description = await generateEventDescription(title, category, event_type, venue_name);
      setFormData(prev => ({ ...prev, description }));
      
      // Save to localStorage
      const updated = { ...formData, description };
      localStorage.setItem('newEventForm', JSON.stringify(updated));
      
    } catch (error) {
      console.error('AI description generation error:', error);
      if (error instanceof Error && error.message.includes('AI service not configured')) {
        alert('AI service is currently unavailable. Using fallback template instead.');
        // Fallback to a simple template
        const fallbackDescription = `Join us for ${title}, a ${event_type.toLowerCase()} event in the ${category.toLowerCase()} category at ${venue_name || 'our venue'}. This promises to be an exciting gathering with great vibes and memorable experiences. Don't miss out on this local happening!`;
        setFormData(prev => ({ ...prev, description: fallbackDescription }));
      } else {
        alert('Failed to generate description. Using fallback template instead.');
        // Fallback to a simple template
        const fallbackDescription = `Join us for ${title}, a ${event_type.toLowerCase()} event in the ${category.toLowerCase()} category at ${venue_name || 'our venue'}. This promises to be an exciting gathering with great vibes and memorable experiences. Don't miss out on this local happening!`;
        setFormData(prev => ({ ...prev, description: fallbackDescription }));
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleLocationSearch = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    console.log('Starting Google Places search for:', query);
    setIsSearching(true);
    
    try {
      const venues = await searchVenues(query);
      console.log('Google Places results:', venues);
      setSearchResults(venues);
    } catch (error) {
      console.error('Google Places search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };



  const selectSearchResult = (result: VenueSearchResult) => {
    setFormData(prev => ({
      ...prev,
      venue_name: result.name,
      venue_address: result.formatted_address
    }));

    // Set the geocoding result
    setGeocodeResult({
      lat: result.lat,
      lng: result.lng,
      place_name: result.formatted_address
    });

    // Clear search results
    setSearchResults([]);
    setGeocodeError(null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For now, we'll create a local URL and store it
      // In production, you'd upload to Supabase Storage or similar
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image_url: imageUrl }));
      setUploadedImages(prev => [...prev, imageUrl]);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const selectExistingImage = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image_url: imageUrl }));
    setIsImageModalOpen(false);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.event_type) newErrors.event_type = "Event type is required";
    if (!formData.venue_name.trim()) newErrors.venue_name = "Venue name is required";
    if (!formData.venue_address.trim()) newErrors.venue_address = "Address is required";
    
    // Check if all date entries are valid
    const invalidDates = formData.dateEntries.filter(entry => 
      !entry.start_at || !entry.end_at || !validateDateRange(entry.start_at, entry.end_at)
    );
    
    if (invalidDates.length > 0) {
      newErrors.dateEntries = "All date entries must have valid start/end times within 1 week";
    }
    
    // Check if geocoding succeeded
    if (!geocodeResult) {
      newErrors.venue_address = "Please enter a valid address";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Create multiple events for each date entry
      const events = formData.dateEntries.map(entry => ({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        start_at: entry.start_at,
        end_at: entry.end_at,
        category: formData.category,
        event_type: formData.event_type,
        venue_name: formData.venue_name.trim(),
        venue_address: formData.venue_address.trim(),
        lat: geocodeResult!.lat,
        lng: geocodeResult!.lng,
        price_cents: formData.price_cents,
        currency: 'USD',
        registration_url: formData.registration_url.trim() || null,
        image_url: formData.image_url.trim() || null,
        website_url: formData.website_url.trim() || null,
        social_links: formData.social_links.trim() ? 
          { links: formData.social_links.split(',').map(s => s.trim()).filter(Boolean) } : null,
        status: 'pending' as const,
      }));
      
      const { error } = await supabase
        .from('events')
        .insert(events);
      
      if (error) throw error;
      
      // Clear localStorage
      localStorage.removeItem('newEventForm');
      
      // Redirect to map with success message
      router.push('/map?success=event_submitted');
      
    } catch (error: unknown) {
      console.error('Submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to submit event: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return formData.title.trim() && 
           formData.category && 
           formData.event_type && 
           formData.venue_name.trim() && 
           formData.venue_address.trim() && 
           geocodeResult && 
           !isGeocoding &&
           formData.dateEntries.every(entry => 
             entry.start_at && entry.end_at && validateDateRange(entry.start_at, entry.end_at)
           );
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      {/* Hero Header - Matching homepage styling */}
      <div className="bg-[rgb(var(--panel)] py-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Create Your Event</h1>
          <p className={`text-lg sm:text-xl ${tokens.muted}`}>
            Share what's happening and reach your community
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Event Details */}
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-[rgb(var(--text))] mb-4">Event Details</h2>
            <div className="bg-[rgb(var(--panel))] rounded-2xl token-border p-5">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                    placeholder="What's happening?"
                  />
                  {errors.title && (
                    <p className="text-sm text-orange-600 mt-1">{errors.title}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        handleInputChange('category', e.target.value);
                        handleInputChange('event_type', ''); // Reset sub-category
                      }}
                      className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                    >
                      <option value="">Select category</option>
                      {Object.keys(eventTypeCategories).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-sm text-orange-600 mt-1">{errors.category}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">Event Type *</label>
                    <select
                      value={formData.event_type}
                      onChange={(e) => handleInputChange('event_type', e.target.value)}
                      disabled={!formData.category}
                      className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select type</option>
                      {formData.category && eventTypeCategories[formData.category as keyof typeof eventTypeCategories]?.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.event_type && (
                      <p className="text-sm text-orange-600 mt-1">{errors.event_type}</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-[rgb(var(--text))]">
                      Description
                    </label>
                    <button
                      type="button"
                      onClick={generateAIDescription}
                      disabled={isGeneratingAI || !formData.title || !formData.category || !formData.event_type}
                      className="px-2 py-1 text-xs rounded-md bg-[rgb(var(--brand))] text-white hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingAI ? 'Generating...' : 'Generate with AI (free)'}
                    </button>
                  </div>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                    placeholder="Tell people about your event..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* When Section */}
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-[rgb(var(--text))] mb-4">When</h2>
            <div className="bg-[rgb(var(--panel))] rounded-2xl token-border p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-[rgb(var(--text))]">Event Dates</h3>
                <button
                  type="button"
                  onClick={addDateEntry}
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-[rgb(var(--brand))] text-white hover:opacity-90 transition-opacity font-medium"
                >
                  <PlusIcon className="w-3 h-3" />
                  Add Date
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.dateEntries.map((entry, index) => (
                  <div key={entry.id} className="p-4 bg-[rgb(var(--bg))] rounded-lg token-border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-[rgb(var(--text))]">
                        Date Entry {index + 1}
                      </h4>
                      {formData.dateEntries.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDateEntry(entry.id)}
                          className="p-1 text-red-500 hover:text-red-600 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">Start Date & Time *</label>
                        <input
                          type="datetime-local"
                          value={entry.start_at}
                          onChange={(e) => handleDateEntryChange(entry.id, 'start_at', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">End Date & Time *</label>
                        <input
                          type="datetime-local"
                          value={entry.end_at}
                          onChange={(e) => handleDateEntryChange(entry.id, 'end_at', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* More Details Section */}
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-[rgb(var(--text))] mb-4">More Details</h2>
            <div className="bg-[rgb(var(--panel))] rounded-2xl token-border p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">Venue Name</label>
                  <input
                    type="text"
                    value={formData.venue_name}
                    onChange={(e) => handleInputChange('venue_name', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                    placeholder="Where is it happening?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">Venue Address</label>
                  <input
                    type="text"
                    value={formData.venue_address}
                    onChange={(e) => handleInputChange('venue_address', e.target.value)}
                    onBlur={handleAddressBlur}
                    className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                    placeholder="Full address"
                  />
                  {isGeocoding && (
                    <p className="text-sm text-blue-600 mt-1">Finding location...</p>
                  )}
                  {geocodeResult && (
                    <p className="text-sm text-green-600 mt-1">
                      Located: {geocodeResult.place_name}
                    </p>
                  )}
                  {geocodeError && (
                    <p className="text-sm text-orange-600 mt-1">{geocodeError}</p>
                  )}
                  {errors.venue_address && (
                    <p className="text-sm text-orange-600 mt-1">{errors.venue_address}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Price Section */}
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-[rgb(var(--text))] mb-4">Price & Tickets</h2>
            <div className="bg-[rgb(var(--panel))] rounded-2xl token-border p-5">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">Price</label>
                  <input
                    type="text"
                    value={formData.price_cents === 0 ? '' : formatMoneyFromCents(formData.price_cents)}
                    onChange={(e) => {
                      const cents = toCents(e.target.value);
                      handleInputChange('price_cents', cents || 0);
                    }}
                    onBlur={(e) => {
                      const cents = toCents(e.target.value);
                      handleInputChange('price_cents', cents || 0);
                    }}
                    className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                    placeholder="$0.00"
                  />
                  <p className="text-sm text-[rgb(var(--muted))] mt-1">
                    Leave blank or $0.00 for free events
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">Tickets Link (optional)</label>
                  <input
                    type="url"
                    value={formData.registration_url}
                    onChange={(e) => handleInputChange('registration_url', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-[rgb(var(--text))] mb-4">Event Image</h2>
            <div className="bg-[rgb(var(--panel))] rounded-2xl token-border p-5">
              {formData.image_url ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img 
                      src={formData.image_url} 
                      alt="Event preview" 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsImageModalOpen(true)}
                      className="px-3 py-1.5 text-sm rounded-md bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-[rgb(var(--brand))] hover:text-white transition-colors font-medium"
                    >
                      Choose Different Image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <label className="flex-1 px-3 py-2 text-sm rounded-md bg-[rgb(var(--brand))] text-white hover:opacity-90 transition-opacity font-medium cursor-pointer text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      Upload Image
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsImageModalOpen(true)}
                      className="flex-1 px-3 py-2 text-sm rounded-md bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-[rgb(var(--brand))] hover:text-white transition-colors font-medium"
                    >
                      Choose from Library
                    </button>
                  </div>
                  <p className="text-xs text-[rgb(var(--muted))] text-center">
                    Recommended: 1200x800 pixels, max 5MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          {formData.title && formData.dateEntries[0]?.start_at && geocodeResult && (
            <div className="bg-[rgb(var(--bg))] rounded-2xl token-border p-5">
              <h4 className="text-sm font-medium mb-3 text-[rgb(var(--muted))]">Preview</h4>
              <div className="space-y-2 text-sm">
                <div className="font-medium text-[rgb(var(--text))]">{formData.title}</div>
                <div className="text-[rgb(var(--muted))]">
                  {formData.dateEntries.length} date{formData.dateEntries.length > 1 ? 's' : ''} • {formData.category} • {formData.event_type}
                </div>
                <div className="text-[rgb(var(--muted))]">{geocodeResult.place_name}</div>
                <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  {formData.price_cents === 0 ? 'Free' : formatMoneyFromCents(formData.price_cents)}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid() || isSubmitting}
            className="w-full py-2 px-4 bg-[rgb(var(--brand))] text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isSubmitting ? 'Submitting...' : `Post ${formData.dateEntries.length > 1 ? formData.dateEntries.length : ''} Event${formData.dateEntries.length > 1 ? 's' : ''} for Review`}
          </button>
        </form>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="pb-20"></div>

      {/* Image Selection Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[rgb(var(--panel))] rounded-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-600">
              <h2 className="text-base font-semibold text-[rgb(var(--text))]">Choose Image</h2>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="p-2 hover:bg-[rgb(var(--bg))] rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-3 space-y-3">
              <div>
                <h3 className="text-sm font-semibold mb-2 text-[rgb(var(--text))]">Upload New Image</h3>
                <label className="flex items-center justify-center w-full h-20 border-2 border-dashed token-border rounded-lg cursor-pointer hover:border-[rgb(var(--brand))] transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="text-center">
                    <PhotoIcon className="w-8 h-8 mx-auto text-[rgb(var(--muted))] mb-1" />
                    <p className="text-xs text-[rgb(var(--muted))]">Click to upload</p>
                  </div>
                </label>
              </div>

              {uploadedImages.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-[rgb(var(--text))]">Previously Uploaded</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {uploadedImages.map((imageUrl, index) => (
                      <button
                        key={index}
                        onClick={() => selectExistingImage(imageUrl)}
                        className="relative group"
                      >
                        <img 
                          src={imageUrl} 
                          alt={`Image ${index + 1}`} 
                          className="w-full h-16 object-cover rounded-lg token-border group-hover:border-[rgb(var(--brand))] transition-colors"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">Select</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
