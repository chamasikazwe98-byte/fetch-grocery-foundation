import { useState, useEffect } from 'react';
import { Car, Bike, MapPin, Clock, Navigation } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Coordinates, calculateDistance, calculateETA, formatDistance, formatETA } from '@/lib/geoUtils';

interface DriverLocation {
  latitude: number;
  longitude: number;
  heading: number | null;
  speed: number | null;
  updated_at: string;
}

interface DriverTrackingMapProps {
  orderId: string;
  driverId: string | null;
  deliveryLatitude: number | null;
  deliveryLongitude: number | null;
  vehicleType?: 'bicycle' | 'motorcycle' | 'car' | null;
}

export function DriverTrackingMap({
  orderId,
  driverId,
  deliveryLatitude,
  deliveryLongitude,
  vehicleType,
}: DriverTrackingMapProps) {
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [eta, setEta] = useState<number | null>(null);

  useEffect(() => {
    if (!driverId) return;

    // Fetch initial location
    const fetchLocation = async () => {
      const { data, error } = await supabase
        .from('driver_locations')
        .select('latitude, longitude, heading, speed, updated_at')
        .eq('driver_id', driverId)
        .single();

      if (!error && data) {
        setDriverLocation(data);
        updateDistanceAndETA(data);
      }
    };

    fetchLocation();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`driver-location-${driverId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_locations',
          filter: `driver_id=eq.${driverId}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            const newLocation = payload.new as DriverLocation;
            setDriverLocation(newLocation);
            updateDistanceAndETA(newLocation);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverId, deliveryLatitude, deliveryLongitude]);

  const updateDistanceAndETA = (location: DriverLocation) => {
    if (deliveryLatitude && deliveryLongitude) {
      const driverCoords: Coordinates = {
        latitude: location.latitude,
        longitude: location.longitude,
      };
      const deliveryCoords: Coordinates = {
        latitude: deliveryLatitude,
        longitude: deliveryLongitude,
      };
      const dist = calculateDistance(driverCoords, deliveryCoords);
      setDistance(dist);

      // Adjust speed based on vehicle type
      let avgSpeed = 30; // Default city speed
      if (vehicleType === 'bicycle') avgSpeed = 15;
      if (vehicleType === 'motorcycle') avgSpeed = 35;
      if (vehicleType === 'car') avgSpeed = 30;

      setEta(calculateETA(dist, avgSpeed));
    }
  };

  const VehicleIcon = vehicleType === 'car' ? Car : vehicleType === 'bicycle' ? Bike : Car;

  if (!driverId) {
    return (
      <div className="bg-muted/30 rounded-xl p-6 text-center">
        <Navigation className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Waiting for a driver to accept your order...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Visualization */}
      <div className="relative bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 min-h-[200px] overflow-hidden">
        {/* Simple visual representation */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Animated connection line */}
          <div className="absolute w-1/2 h-0.5 bg-gradient-to-r from-primary to-green-500 animate-pulse" />
        </div>

        {/* Driver position */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <VehicleIcon className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-card px-2 py-0.5 rounded text-xs font-medium shadow">
              Driver
            </div>
          </div>
        </div>

        {/* Delivery destination */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <MapPin className="h-7 w-7 text-white" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-card px-2 py-0.5 rounded text-xs font-medium shadow">
              You
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Navigation className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Distance</p>
          <p className="text-lg font-bold text-primary">
            {distance !== null ? formatDistance(distance) : '--'}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Clock className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">ETA</p>
          <p className="text-lg font-bold text-primary">
            {eta !== null ? formatETA(eta) : '--'}
          </p>
        </div>
      </div>

      {/* Live indicator */}
      {driverLocation && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          Live tracking active
        </div>
      )}
    </div>
  );
}
