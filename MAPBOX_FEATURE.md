# Mapbox Address Autocomplete Feature

## Overview

The NeighborhoodRank app now features intelligent address autocomplete powered by Mapbox, making it easier for users to find and rate neighborhoods and buildings across Canada.

## Features

✅ **Smart Autocomplete** - Real-time address suggestions as you type
✅ **Canada-Only Results** - Filtered to show only Canadian locations
✅ **Neighborhood Search** - Find neighborhoods, districts, and localities
✅ **Building Search** - Search for specific addresses and points of interest
✅ **Auto-fill Forms** - Automatically populates city, province, and coordinates
✅ **Beautiful UI** - Matches the site's modern orange/white theme
✅ **Responsive Design** - Works perfectly on mobile and desktop
✅ **Visual Confirmation** - Shows selected location with green checkmark

## How It Works

### For Neighborhoods

1. User clicks "Rate a Neighborhood"
2. Types in the search box (e.g., "Liberty Village")
3. Selects from autocomplete suggestions
4. City and province auto-fill
5. User proceeds to rate categories

### For Buildings

1. User clicks "Rate an Apartment/Building"
2. Types address or building name (e.g., "123 King St, Toronto")
3. Selects from autocomplete suggestions
4. Building name, city, and province auto-fill
5. User can edit building name if needed
6. User proceeds to rate categories

## Technical Details

### Component: `AddressAutocomplete.tsx`

**Props:**
- `type`: 'neighborhood' | 'building' - Determines search behavior
- `onAddressSelect`: Callback function with selected location data
- `placeholder`: Custom placeholder text
- `label`: Form label text

**Returned Data:**
```typescript
{
  address: string      // Full address or place name
  city: string         // City name
  province: string     // Province/state name
  latitude: number     // Geographic latitude
  longitude: number    // Geographic longitude
}
```

### Dependencies

```json
{
  "mapbox-gl": "^3.x",
  "@mapbox/mapbox-gl-geocoder": "^5.x"
}
```

### Configuration

**Mapbox Access Token:** Stored in component
- Token: `pk.eyJ1Ijoic2FrYW11c2UiLCJhIjoi...`
- Scope: Canada only (`countries: 'CA'`)
- Bounding Box: [-141.0, 41.7, -52.6, 83.1]

### Search Types

**Neighborhood Mode:**
- Types: `neighborhood, locality, place, district`
- Returns: Neighborhood names and general areas
- Example: "Liberty Village, Toronto, Ontario"

**Building Mode:**
- Types: `address, poi, place`
- Returns: Specific street addresses and buildings
- Example: "123 King Street West, Toronto, Ontario"

## Styling

The autocomplete input matches the site's design system:

- **Border:** Rounded corners (0.75rem)
- **Colors:** 
  - Default: Gray border (#d1d5db)
  - Hover: Darker gray (#9ca3af)
  - Focus: Orange border (#f97316) with shadow
- **Icons:** MapPin icon from Lucide React
- **Animation:** Smooth transitions and hover effects
- **Selected State:** Green background with checkmark

## User Experience

### Desktop
- Full-width search box with icon
- Dropdown appears below input
- Hover effects on suggestions
- Keyboard navigation supported

### Mobile
- Responsive width
- Touch-friendly tap targets
- Optimized font sizes
- Scrollable suggestions

## Future Enhancements

Potential improvements:
- [ ] Save recent searches
- [ ] Show map preview on hover
- [ ] Display distance from user's location
- [ ] Add postal code to results
- [ ] Support multiple languages (French for Quebec)

## Troubleshooting

### Autocomplete not appearing
- Check Mapbox token is valid
- Verify internet connection
- Check browser console for errors

### No results showing
- Confirm searching within Canada
- Try different search terms
- Check if location exists in Mapbox data

### Styling issues
- Clear browser cache
- Check CSS is loading properly
- Verify Tailwind classes are compiling

## API Rate Limits

Mapbox free tier includes:
- 100,000 requests per month
- More than sufficient for typical usage
- Upgrade plan if needed for high traffic

## Security

- API token is public (intended for client-side use)
- Restricted to specific domains in Mapbox dashboard
- No sensitive data exposed
- HTTPS only

---

For more information, visit [Mapbox Geocoding API Documentation](https://docs.mapbox.com/api/search/geocoding/)

