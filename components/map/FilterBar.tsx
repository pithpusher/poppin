"use client";

import { useState } from 'react';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';

export type Range = "today" | "week" | "month" | "all";

export interface FilterBarProps {
  range: Range;
  setRange: (range: Range) => void;
  onlyFree: boolean;
  setOnlyFree: (free: boolean) => void;
  startDate: string | null;
  endDate: string | null;
  setStartDate: (date: string | null) => void;
  setEndDate: (date: string | null) => void;
  onApplyCustom: () => void;
  // New filter props
  eventTypes: string[];
  setEventTypes: (types: string[]) => void;
  ageRestriction: string;
  setAgeRestriction: (age: string) => void;
}

export default function FilterBar({
  range,
  setRange,
  onlyFree,
  setOnlyFree,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  onApplyCustom,
  eventTypes,
  setEventTypes,
  ageRestriction,
  setAgeRestriction
}: FilterBarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize all event types as selected when modal opens
  const initializeAllEventTypes = () => {
    const allTypes = Object.values(eventTypeCategories).flat();
    setEventTypes(allTypes);
  };

  const quickFilters = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "all", label: "All" },
  ];

  const eventTypeCategories = {
    "Music": ["Rock", "Hip-Hop / Rap", "EDM / Dance", "Country", "Jazz / Blues", "Pop", "Classical / Orchestra", "Open Mic / Jam"],
    "Food & Drink": ["Food Trucks", "Wine / Beer Festivals", "Pop-up Dining"],
    "Nightlife": ["Clubs / DJ Sets", "Bar Specials", "Karaoke"],
    "Family & Kids": ["Storytime / Library Events", "Festivals / Fairs", "Sports / Rec"],
    "Arts & Culture": ["Theatre / Plays", "Art Exhibits", "Comedy", "Film / Screenings"],
    "Community & Causes": ["Markets / Craft Fairs", "Charity / Fundraisers", "Civic / Town Hall"],
    "Education & Workshops": ["Business / Networking", "Classes & Seminars", "Tech & Startup Events"],
    "Sports & Recreation": ["Games / Tournaments", "Races / Fun Runs", "Outdoor Adventures"],
    "Shopping & Sales": ["Store Sales / Clearance", "Flea Markets", "Grand Openings"]
  };

  const ageRestrictions = ["All Ages", "18+", "21+"];

  const handleEventTypeToggle = (type: string) => {
    if (eventTypes.includes(type)) {
      setEventTypes(eventTypes.filter(t => t !== type));
    } else {
      setEventTypes([...eventTypes, type]);
    }
  };

  const handleCategoryToggle = (category: string) => {
    const categoryTypes = eventTypeCategories[category as keyof typeof eventTypeCategories] || [];
    const hasAllTypes = categoryTypes.every(type => eventTypes.includes(type));
    
    if (hasAllTypes) {
      // Remove all types from this category
      setEventTypes(eventTypes.filter(type => !categoryTypes.includes(type)));
    } else {
      // Add all types from this category
      const newTypes = [...eventTypes];
      categoryTypes.forEach(type => {
        if (!newTypes.includes(type)) {
          newTypes.push(type);
        }
      });
      setEventTypes(newTypes);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (onlyFree) count++;
    if (eventTypes.length > 0) count++;
    if (ageRestriction !== "All Ages") count++;
    return count;
  };

  const clearAllFilters = () => {
    setOnlyFree(false);
    setEventTypes([]);
    setAgeRestriction("All Ages");
    setRange("all");
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <>
      {/* Quick Filters Bar */}
      <div className="bg-[rgb(var(--panel))] token-border-b">
        <div className="max-w-6xl mx-auto px-3 py-2 flex justify-center">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Date Range Quick Filters */}
            <div className="flex items-center gap-1">
              {quickFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setRange(filter.value as Range)}
                  className={`px-2 py-1 text-xs rounded-md transition-colors font-medium ${
                    range === filter.value
                      ? "bg-[rgb(var(--brand))] text-white shadow-sm"
                      : "hover:bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:text-white"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Free Toggle */}
            <button
              onClick={() => setOnlyFree(!onlyFree)}
              className={`px-3 py-1 text-xs rounded-md transition-colors font-medium ${
                onlyFree
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-green-600 hover:text-white"
              }`}
            >
              Free Only
            </button>

            {/* More Filters Button */}
            <button
              onClick={() => {
                setIsModalOpen(true);
                initializeAllEventTypes();
              }}
              className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-md bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-[rgb(var(--brand))] hover:text-white transition-colors font-medium"
            >
              <FunnelIcon className="w-3.5 h-3.5" />
              More Filters
              {getActiveFiltersCount() > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>

            {/* Clear All */}
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-1 text-xs rounded-md bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-red-500 hover:text-white transition-colors font-medium"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

             {/* Filter Modal */}
       {isModalOpen && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-[rgb(var(--panel))] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col mb-16">
             {/* Modal Header */}
             <div className="flex items-center justify-between p-3 border-b border-gray-600">
               <h2 className="text-lg font-semibold text-white">More Filters</h2>
               <button
                 onClick={() => setIsModalOpen(false)}
                 className="p-2 hover:bg-[rgb(var(--bg))] rounded-lg transition-colors"
               >
                 <XMarkIcon className="w-5 h-5" />
               </button>
             </div>

                         {/* Modal Content */}
             <div className="p-3 space-y-3 flex-1 overflow-y-auto">
               {/* Custom Date Range Section */}
               <div>
                 <h3 className="text-sm font-semibold mb-2 text-white">Date Range</h3>
                 <div className="p-2 bg-[rgb(var(--bg))] rounded-lg token-border">
                   <div className="grid grid-cols-2 gap-2">
                     <div>
                       <label className="block text-xs font-medium mb-1 text-[rgb(var(--text))]">From</label>
                       <input
                         type="date"
                         value={startDate || ""}
                         onChange={(e) => setStartDate(e.target.value || null)}
                         className="w-full px-2 py-1 rounded-lg token-border bg-[rgb(var(--panel))] text-[rgb(var(--text))] text-xs"
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-medium mb-1 text-[rgb(var(--text))]">To</label>
                       <input
                         type="date"
                         value={endDate || ""}
                         onChange={(e) => setEndDate(e.target.value || null)}
                         className="w-full px-2 py-1 rounded-lg token-border bg-[rgb(var(--panel))] text-[rgb(var(--text))] text-xs"
                       />
                     </div>
                   </div>
                   {(startDate || endDate) && (
                     <button
                       onClick={onApplyCustom}
                       className="mt-2 px-2 py-1 bg-[rgb(var(--brand))] text-white rounded-lg hover:opacity-90 transition-opacity text-xs font-medium"
                     >
                       Apply Range
                     </button>
                   )}
                 </div>
               </div>

               {/* Pricing & Age Restrictions Section - Combined in one card */}
               <div>
                 <h3 className="text-sm font-semibold mb-2 text-white">Pricing & Age Restrictions</h3>
                 <div className="p-2 bg-[rgb(var(--bg))] rounded-lg token-border">
                   <div className="grid grid-cols-2 gap-3">
                     {/* Pricing Section */}
                     <div>
                       <h4 className="text-xs font-medium mb-1 text-[rgb(var(--muted))]">Pricing</h4>
                       <div className="space-y-1">
                         <label className="flex items-center gap-2">
                           <input
                             type="checkbox"
                             checked={onlyFree}
                             onChange={(e) => setOnlyFree(e.target.checked)}
                             className="w-3 h-3 text-red-500 rounded [&:checked]:bg-red-500 [&:checked]:border-red-500"
                           />
                           <span className="text-xs text-[rgb(var(--text))]">Free events only</span>
                         </label>
                       </div>
                     </div>

                     {/* Age Restrictions Section */}
                     <div>
                       <h4 className="text-xs font-medium mb-1 text-[rgb(var(--muted))]">Age Restrictions</h4>
                       <div className="space-y-1">
                         {ageRestrictions.map((age) => (
                           <label key={age} className="flex items-center gap-2">
                             <input
                               type="radio"
                               name="ageRestriction"
                               value={age}
                               checked={ageRestriction === age}
                               onChange={(e) => setAgeRestriction(e.target.value)}
                               className="w-3 h-3 text-red-500 [&:checked]:bg-red-500 [&:checked]:border-red-500"
                             />
                             <span className="text-xs text-[rgb(var(--text))]">{age}</span>
                           </label>
                         ))}
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Event Types Section - Individual Cards */}
               <div>
                 <h3 className="text-sm font-semibold mb-2 text-white">Event Categories</h3>
                 <div className="grid grid-cols-1 gap-2">
                   {Object.entries(eventTypeCategories).map(([category, types]) => (
                     <div key={category} className="p-2 bg-[rgb(var(--bg))] rounded-lg token-border">
                       <div className="flex items-center justify-between mb-1">
                         <h4 className="text-xs font-semibold text-[rgb(var(--muted))]">{category}</h4>
                         <div className="flex gap-2">
                           <button
                             onClick={() => handleCategoryToggle(category)}
                             className="text-xs text-[rgb(var(--muted))] hover:opacity-80 transition-opacity font-medium"
                           >
                             {types.every(type => eventTypes.includes(type)) ? 'Deselect All' : 'Select All'}
                           </button>
                         </div>
                       </div>
                       <div className="grid grid-cols-2 gap-1">
                         {types.map((type) => (
                           <label key={type} className="flex items-center gap-2 text-xs">
                             <input
                               type="checkbox"
                               checked={eventTypes.includes(type)}
                               onChange={() => handleEventTypeToggle(type)}
                               className="w-3 h-3 text-red-500 rounded [&:checked]:bg-red-500 [&:checked]:border-red-500"
                             />
                             <span className="text-[rgb(var(--text))]">{type}</span>
                           </label>
                         ))}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>

                         {/* Modal Footer - Sticky */}
             <div className="sticky bottom-0 bg-[rgb(var(--panel))] border-t border-gray-600 p-3 rounded-b-2xl">
               <div className="flex items-center justify-between">
                 <div className="flex gap-2">
                   <button
                     onClick={() => {
                       const allTypes = Object.values(eventTypeCategories).flat();
                       setEventTypes(allTypes);
                     }}
                     className="px-2 py-1 text-xs hover:bg-[rgb(var(--bg))] rounded-lg transition-colors text-[rgb(var(--muted))]"
                   >
                     Select All
                   </button>
                   <button
                     onClick={clearAllFilters}
                     className="px-2 py-1 text-xs hover:bg-[rgb(var(--bg))] rounded-lg transition-colors text-[rgb(var(--muted))]"
                   >
                     Deselect All
                   </button>
                 </div>
                 <button
                   onClick={() => setIsModalOpen(false)}
                   className="px-4 py-1.5 bg-[rgb(var(--brand))] text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
                 >
                   Done
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}
    </>
  );
}
