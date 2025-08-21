# Search & Discovery Features

This document outlines the new search and discovery improvements implemented in the Poppin app.

## New Features

### 1. Enhanced Filters & Sorting

#### Price Range Filter
- **New**: Price range slider (0-$100) for more granular price filtering
- **Existing**: Free events toggle
- **Integration**: Works alongside existing filters

#### Event Type Categories
- **Music**: Rock, Hip-Hop/Rap, EDM/Dance, Country, Jazz/Blues, Pop, Classical/Orchestra, Open Mic/Jam
- **Food & Drink**: Food Trucks, Wine/Beer Festivals, Pop-up Dining
- **Nightlife**: Clubs/DJ Sets, Bar Specials, Karaoke
- **Family & Kids**: Storytime/Library Events, Festivals/Fairs, Sports/Rec
- **Arts & Culture**: Theatre/Plays, Art Exhibits, Comedy, Film/Screenings
- **Community & Causes**: Markets/Craft Fairs, Charity/Fundraisers, Civic/Town Hall
- **Education & Workshops**: Business/Networking, Classes & Seminars, Tech & Startup Events
- **Sports & Recreation**: Games/Tournaments, Races/Fun Runs, Outdoor Adventures
- **Shopping & Sales**: Store Sales/Clearance, Flea Markets, Grand Openings

#### Age Restrictions
- All Ages
- 18+
- 21+

### 2. Saved Searches

#### Features
- Save current search criteria with custom names
- Quick access to favorite search combinations
- Persistent storage across sessions
- Easy management (rename, delete)

#### Usage
1. Click the "Saved" button in the search toolbar
2. Enter a name for your current search
3. Click "Save" to store the search
4. Access saved searches anytime from the same button

#### What Gets Saved
- Date range (Today, This Week, This Month, All)
- Free events toggle
- Custom date range
- Selected event types
- Age restrictions
- Search location (if any)

### 3. Recent Searches

#### Features
- Automatic tracking of search terms and locations
- Quick access to previous searches
- Location-aware search history
- Clear individual or all searches

#### Usage
1. Click the "Recent" button in the search toolbar
2. View your search history
3. Click on any recent search to repeat it
4. Use "Clear All" to reset history

#### What Gets Tracked
- Search terms
- Geographic locations
- Timestamps
- User interactions

### 4. Popular Events

#### Features
- Trending events based on view counts
- Time-based filtering (Today, This Week, This Month)
- Location-aware recommendations
- Visual popularity indicators

#### Usage
1. Click the "Trending" button (orange gradient)
2. Select timeframe
3. Browse popular events
4. Click on events to view details

#### Popularity Metrics
- View count
- Recency
- Event type popularity
- Location relevance

### 5. Personalized Recommendations

#### Features
- AI-powered event suggestions
- Based on user behavior and preferences
- Fallback to general recommendations
- Similarity scoring system

#### Usage
1. Click the "For You" button (purple gradient)
2. View personalized suggestions
3. See why events are recommended
4. Interact with events to improve recommendations

#### Personalization Factors
- Favorite event types (based on interactions)
- Price preferences
- Time preferences
- Location preferences
- Interaction history (views, likes, bookmarks)

## Database Schema

### New Tables

#### `saved_searches`
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to auth.users)
- name: TEXT (Search name)
- filters: JSONB (Search criteria)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `recent_searches`
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to auth.users)
- search_term: TEXT (Search query)
- location: JSONB (Geographic data)
- created_at: TIMESTAMP
```

#### `user_event_interactions`
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to auth.users)
- event_id: UUID (Foreign Key to events)
- interaction_type: TEXT (view, like, bookmark, share)
- created_at: TIMESTAMP
```

### Enhanced Tables

#### `events`
```sql
- view_count: INTEGER (New column for popularity tracking)
```

## API Endpoints

### Existing Endpoints
- `/api/geocode` - Location search and suggestions
- `/api/events` - Event data with enhanced filtering

### New Database Functions
- `increment_event_view_count(event_uuid)` - Update view count
- `track_event_view(event_uuid, user_uuid)` - Record user interaction

## Security

### Row Level Security (RLS)
- All new tables have RLS enabled
- Users can only access their own data
- Proper authentication required

### Data Privacy
- Search history is user-specific
- No cross-user data sharing
- Secure user authentication

## Performance Optimizations

### Indexes
- User ID indexes for fast queries
- Timestamp indexes for sorting
- Event type and price indexes for filtering

### Caching
- Component-level state management
- Debounced search suggestions
- Optimized re-renders

## Mobile Responsiveness

### Design Features
- Touch-friendly interfaces
- Responsive layouts
- Mobile-optimized modals
- Swipe gestures support

### Performance
- Optimized for mobile devices
- Reduced bundle sizes
- Efficient state management

## Future Enhancements

### Planned Features
- Advanced geospatial queries
- Machine learning recommendations
- Social sharing integration
- Event similarity matching
- Advanced analytics dashboard

### Technical Improvements
- GraphQL API
- Real-time updates
- Offline support
- Progressive Web App features

## Usage Examples

### Saving a Search
1. Set filters: "This Week", "Free events only", "Music" category
2. Click "Saved" button
3. Name: "Free Music This Week"
4. Save and access later

### Finding Popular Events
1. Click "Trending" button
2. Select "This Week"
3. Browse top 10 events
4. Click on events for details

### Getting Recommendations
1. Interact with several events (view, like)
2. Click "For You" button
3. See personalized suggestions
4. Improve recommendations over time

## Troubleshooting

### Common Issues
- **No recommendations**: Interact with more events first
- **Search not saving**: Check user authentication
- **Filters not working**: Clear browser cache
- **Performance issues**: Check network connectivity

### Support
- Check browser console for errors
- Verify user authentication
- Clear browser cache and cookies
- Contact development team for issues

## Contributing

### Development Setup
1. Run database migrations
2. Install dependencies
3. Set up environment variables
4. Start development server

### Code Structure
- Components in `/components/map/`
- Database logic in `/lib/`
- Types in component files
- Styling with Tailwind CSS

### Testing
- Test all filter combinations
- Verify mobile responsiveness
- Check accessibility
- Performance testing
