import { useState } from "react";

type Coordinates = {
  latitude: number;
  longitude: number;
};

export function useCurrentLocation() {
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  function requestCurrentLocation() {
    if (!("geolocation" in navigator)) {
      const error = "Current location is not available in this browser.";
      setLocationError(error);
      return Promise.reject(new Error(error));
    }

    setIsLocating(true);
    setLocationError(null);

    return new Promise<Coordinates>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          const error = "Unable to access your location. Check browser permissions and try again.";
          setIsLocating(false);
          setLocationError(error);
          reject(new Error(error));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      );
    });
  }

  function clearLocationError() {
    setLocationError(null);
  }

  return {
    clearLocationError,
    isLocating,
    locationError,
    requestCurrentLocation,
  };
}
