import { useState, useEffect, useCallback } from 'react';
import { MapPin, Search, Loader2, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getCurrentPosition, Coordinates } from '@/lib/geoUtils';

interface LocationPickerProps {
  onLocationSelect: (coords: Coordinates, address: string) => void;
  initialAddress?: string;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export function LocationPicker({ onLocationSelect, initialAddress = '' }: LocationPickerProps) {
  const { toast } = useToast();
  const [address, setAddress] = useState(initialAddress);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<Coordinates | null>(null);

  // Debounce search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchAddress(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search using OpenStreetMap Nominatim (free alternative to Google Maps)
  const searchAddress = async (query: string) => {
    setIsSearching(true);
    try {
      // Append Zambia to improve local results
      const searchTerm = query.toLowerCase().includes('zambia') 
        ? query 
        : `${query}, Zambia`;
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=5&countrycodes=zm`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search Failed',
        description: 'Could not search for address. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const position = await getCurrentPosition();
      const coords: Coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setSelectedCoords(coords);

      // Reverse geocode to get address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      const data = await response.json();
      
      const displayAddress = data.display_name || `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
      setAddress(displayAddress);
      onLocationSelect(coords, displayAddress);

      toast({
        title: 'Location Detected',
        description: 'Your current location has been set.',
      });
    } catch (error: any) {
      console.error('Geolocation error:', error);
      
      let message = 'Could not get your location.';
      if (error.code === 1) {
        message = 'Location permission denied. Please enable location access.';
      } else if (error.code === 2) {
        message = 'Location unavailable. Please try again.';
      } else if (error.code === 3) {
        message = 'Location request timed out. Please try again.';
      }
      
      toast({
        title: 'Location Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    const coords: Coordinates = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    };
    setSelectedCoords(coords);
    setAddress(result.display_name);
    setSearchQuery('');
    setSearchResults([]);
    onLocationSelect(coords, result.display_name);
  };

  return (
    <div className="space-y-4">
      {/* Use Current Location Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start gap-2 border-primary text-primary hover:bg-primary/10"
        onClick={handleUseCurrentLocation}
        disabled={isGettingLocation}
      >
        {isGettingLocation ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Navigation className="h-4 w-4" />
        )}
        📍 Use My Current Location
      </Button>

      {/* Address Search */}
      <div className="space-y-2">
        <Label>Search Address</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for an address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="border border-border rounded-lg overflow-hidden bg-card shadow-lg">
            {searchResults.map((result) => (
              <button
                key={result.place_id}
                type="button"
                className="w-full px-4 py-3 text-left hover:bg-muted/50 border-b last:border-b-0 transition-colors"
                onClick={() => handleSelectResult(result)}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm line-clamp-2">{result.display_name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Address Display */}
      {selectedCoords && address && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-primary">Delivery Location Set</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{address}</p>
              <p className="text-xs text-muted-foreground mt-1">
                GPS: {selectedCoords.latitude.toFixed(6)}, {selectedCoords.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
