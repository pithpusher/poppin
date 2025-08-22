"use client";

import { useState, useMemo } from 'react';
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
  // Price range filter
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
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
  setAgeRestriction,
  priceRange,
  setPriceRange
}: FilterBarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoize event type categories to prevent unnecessary re-creation
  const eventTypeCategories = useMemo(() => ({
    "Music": ["Rock", "Hip-Hop / Rap", "EDM / Dance", "Country", "Jazz / Blues", "Pop", "Classical / Orchestra", "Open Mic / Jam"],
    "Food & Drink": ["Food Trucks", "Wine / Beer Festivals", "Pop-up Dining"],
    "Nightlife": ["Clubs / DJ Sets", "Bar Specials", "Karaoke"],
    "Family & Kids": ["Storytime / Library Events", "Festivals / Fairs", "Sports / Rec"],
    "Arts & Culture": ["Theatre / Plays", "Art Exhibits", "Comedy", "Film / Screenings"],
    "Community & Causes": ["Markets / Craft Fairs", "Charity / Fundraisers", "Civic / Town Hall"],
    "Education & Workshops": ["Business / Networking", "Classes & Seminars", "Tech & Startup Events"],
    "Sports & Recreation": ["Games / Tournaments", "Races / Fun Runs", "Outdoor Adventures"],
    "Shopping & Sales": ["Store Sales / Clearance", "Flea Markets", "Grand Openings"]
  }), []);

  // Memoize age restrictions
  const ageRestrictions = useMemo(() => ["All Ages", "18+", "21+"], []);

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

  const handleEventTypeToggle = (type: string) => {
    setEventTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleCategoryToggle = (category: string) => {
    const categoryTypes = eventTypeCategories[category as keyof typeof eventTypeCategories] || [];
    const hasAllTypes = categoryTypes.every(type => eventTypes.includes(type));
    
    setEventTypes(prev => {
      if (hasAllTypes) {
        // Remove all types from this category
        return prev.filter(type => !categoryTypes.includes(type));
      } else {
        // Add all types from this category
        const newTypes = [...prev];
        categoryTypes.forEach(type => {
          if (!newTypes.includes(type)) {
            newTypes.push(type);
          }
        });
        return newTypes;
      }
    });
  };

  // Memoize active filters count to prevent unnecessary recalculations
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (onlyFree) count++;
    if (eventTypes.length > 0) count++;
    if (ageRestriction !== "All Ages") count++;
    return count;
  }, [onlyFree, eventTypes.length, ageRestriction]);

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
      <div className="w-full bg-[rgb(var(--panel))]">
        <div className="w-full py-2 md:py-3 flex justify-center">
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            {/* Date Range Quick Filters */}
            <div className="flex items-center gap-1 md:gap-2">
              {quickFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setRange(filter.value as Range)}
                  className={`px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm rounded-md transition-colors font-medium ${
                    range === filter.value
                      ? "bg-[rgb(var(--brand))] text-white shadow-sm"
                      : "hover:bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:text-white"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>



            {/* More Filters Button */}
            <button
              onClick={() => {
                setIsModalOpen(true);
                initializeAllEventTypes();
              }}
              className="flex items-center gap-1.5 md:gap-2 px-3 py-1 md:px-4 md:py-1.5 text-xs md:text-sm rounded-md bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-[rgb(var(--brand))] hover:text-white transition-colors font-medium"
            >
              <FunnelIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              More Filters
              {activeFiltersCount > 0 && (
                <span className="bg-red-500 text-white text-xs md:text-sm rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center font-semibold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Clear All */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-1 md:px-4 md:py-1.5 text-xs md:text-sm rounded-md bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-red-500 hover:text-white transition-colors font-medium"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

             {/* Filter Modal */}
       {isModalOpen && (
         <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 md:p-6">
           <div className="bg-[rgb(var(--panel))] rounded-2xl md:rounded-3xl max-w-2xl md:max-w-4xl w-full max-h-[85vh] flex flex-col mb-16">
             {/* Modal Header */}
             <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-600">
               <h2 className="text-lg md:text-xl font-semibold text-[rgb(var(--text))]">More Filters</h2>
               <button
                 onClick={() => setIsModalOpen(false)}
                 className="p-2 md:p-3 hover:bg-[rgb(var(--bg))] rounded-lg transition-colors"
               >
                 <XMarkIcon className="w-5 h-5 md:w-6 md:h-6" />
               </button>
             </div>

                         {/* Modal Content */}
             <div className="p-3 md:p-4 space-y-3 md:space-y-4 flex-1 overflow-y-auto">
               {/* Custom Date Range Section */}
               <div>
                 <h3 className="text-sm md:text-base font-semibold mb-2 md:mb-3 text-[rgb(var(--text))]">Date Range</h3>
                 <div className="p-2 md:p-3 bg-[rgb(var(--bg))] rounded-lg token-border">
                   <div className="grid grid-cols-2 gap-2 md:gap-3">
                     <div>
                       <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-[rgb(var(--text))]">From</label>
                       <input
                         type="date"
                         value={startDate || ""}
                         onChange={(e) => setStartDate(e.target.value || null)}
                         className="w-full min-w-0 px-2 py-1 rounded-lg token-border bg-[rgb(var(--panel))] text-[rgb(var(--text))] text-xs"
                       />
                     </div>
                     <div>
                       <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-[rgb(var(--text))]">To</label>
                       <input
                         type="date"
                         value={endDate || ""}
                         onChange={(e) => setEndDate(e.target.value || null)}
                         className="w-full min-w-0 px-2 py-1 rounded-lg token-border bg-[rgb(var(--panel))] text-[rgb(var(--text))] text-xs"
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
                 <h3 className="text-sm md:text-base font-semibold mb-2 md:mb-3 text-[rgb(var(--text))]">Pricing & Age Restrictions</h3>
                 <div className="p-2 md:p-3 bg-[rgb(var(--bg))] rounded-lg token-border">
                   <div className="grid grid-cols-2 gap-3 md:gap-4">
                     {/* Pricing Section */}
                     <div>
                       <h4 className="text-xs md:text-sm font-medium mb-1 md:mb-2 text-[rgb(var(--muted))]">Pricing</h4>
                       <div className="space-y-2">
                         <button
                           onClick={() => setOnlyFree(!onlyFree)}
                           className={`px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm rounded-md transition-colors font-medium ${
                             onlyFree
                               ? "bg-red-800 text-white"
                               : "bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-red-800 hover:text-white"
                           }`}
                         >
                           Free events only
                         </button>
                       </div>
                     </div>

                     {/* Age Restrictions Section */}
                     <div>
                       <h4 className="text-xs md:text-sm font-medium mb-1 md:mb-2 text-[rgb(var(--muted))]">Age Restrictions</h4>
                       <div className="space-y-1 md:space-y-2">
                         <div className="flex gap-1 md:gap-2">
                           {ageRestrictions.map((age) => (
                             <button
                               key={age}
                               onClick={() => setAgeRestriction(age)}
                               className={`px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm rounded-md transition-colors font-medium ${
                                 ageRestriction === age
                                   ? "bg-red-800 text-white"
                                   : "bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-red-800 hover:text-white"
                               }`}
                             >
                               {age}
                             </button>
                           ))}
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Event Types Section - Individual Cards */}
               <div>
                 <h3 className="text-sm md:text-base font-semibold mb-2 md:mb-3 text-[rgb(var(--text))]">Event Categories</h3>
                 <div className="grid grid-cols-1 gap-2 md:gap-3">
                   {Object.entries(eventTypeCategories).map(([category, types]) => (
                     <div key={category} className="p-2 md:p-3 bg-[rgb(var(--bg))] rounded-lg token-border">
                       <div className="flex items-center justify-between mb-1 md:mb-2">
                         <h4 className="text-xs md:text-sm font-semibold text-[rgb(var(--muted))]">{category}</h4>
                         <div className="flex gap-2 md:gap-3">
                           <button
                             onClick={() => handleCategoryToggle(category)}
                             className="text-xs md:text-sm text-[rgb(var(--muted))] hover:opacity-80 transition-opacity font-medium"
                           >
                             {types.every(type => eventTypes.includes(type)) ? 'Deselect All' : 'Select All'}
                           </button>
                         </div>
                       </div>
                       <div className="grid grid-cols-2 gap-1 md:gap-2">
                         {types.map((type) => (
                           <button
                             key={type}
                             onClick={() => handleEventTypeToggle(type)}
                             className={`px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm rounded-md transition-colors font-medium text-left ${
                               eventTypes.includes(type)
                                 ? "bg-red-800 text-white"
                                 : "bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-red-800 hover:text-white"
                             }`}
                           >
                             {type}
                           </button>
                         ))}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>

                         {/* Modal Footer - Sticky */}
             <div className="sticky bottom-0 bg-[rgb(var(--panel))] border-t border-gray-600 p-3 md:p-4 rounded-b-2xl">
               <div className="flex items-center justify-between">
                 <div className="flex gap-2 md:gap-3">
                   <button
                     onClick={() => {
                       const allTypes = Object.values(eventTypeCategories).flat();
                       setEventTypes(allTypes);
                     }}
                     className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm hover:bg-[rgb(var(--bg))] rounded-lg transition-colors text-[rgb(var(--muted))]"
                   >
                     Select All
                   </button>
                   <button
                     onClick={() => setEventTypes([])}
                     className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm hover:bg-[rgb(var(--bg))] rounded-lg transition-colors text-[rgb(var(--muted))]"
                   >
                     Deselect All
                   </button>
                 </div>
                 <button
                   onClick={() => setIsModalOpen(false)}
                   className="px-4 md:px-6 py-1.5 md:py-2 bg-[rgb(var(--brand))] text-white rounded-lg hover:opacity-90 transition-opacity text-sm md:text-base"
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
