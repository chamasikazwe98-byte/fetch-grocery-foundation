import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseDriverLocationTrackerOptions {
  orderId: string | null;
  isActive: boolean;
  intervalMs?: number;
}

/**
 * Hook for drivers to track and send their location every 30 seconds
 */
export function useDriverLocationTracker({
  orderId,
  isActive,
  intervalMs = 30000,
}: UseDriverLocationTrackerOptions) {
  const { toast } = useToast();
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPositionRef = useRef<GeolocationPosition | null>(null);

  const sendLocation = useCallback(async () => {
    if (!orderId || !lastPositionRef.current) return;

    const { coords } = lastPositionRef.current;

    try {
      const { error } = await supabase.rpc('upsert_driver_location', {
        p_order_id: orderId,
        p_latitude: coords.latitude,
        p_longitude: coords.longitude,
        p_accuracy: coords.accuracy,
        p_heading: coords.heading,
        p_speed: coords.speed,
      });

      if (error) {
        console.error('Failed to update location:', error);
      }
    } catch (err) {
      console.error('Error sending location:', err);
    }
  }, [orderId]);

  const handlePositionUpdate = useCallback((position: GeolocationPosition) => {
    lastPositionRef.current = position;
  }, []);

  const handlePositionError = useCallback(
    (error: GeolocationPositionError) => {
      console.error('Geolocation error:', error);
      if (error.code === error.PERMISSION_DENIED) {
        toast({
          title: 'Location Access Required',
          description: 'Please enable location services to track deliveries.',
          variant: 'destructive',
        });
      }
    },
    [toast]
  );

  useEffect(() => {
    if (!isActive || !orderId) {
      // Cleanup when not active
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start watching position
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePositionUpdate,
        handlePositionError,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        }
      );

      // Send location immediately and then every interval
      sendLocation();
      intervalRef.current = setInterval(sendLocation, intervalMs);
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, orderId, intervalMs, sendLocation, handlePositionUpdate, handlePositionError]);

  return {
    lastPosition: lastPositionRef.current,
  };
}
