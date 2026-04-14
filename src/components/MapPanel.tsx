import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Autocomplete,
  GoogleMap,
  InfoWindow,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { serviceLabels } from "../data/labs";
import type { LabService, PhotoLab } from "../types";
import "./MapPanel.css";

type MapPanelProps = {
  activeServices: LabService[];
  activeLatitude: number | null;
  activeLongitude: number | null;
  detailSearch: string;
  labs: PhotoLab[];
  onPlaceSelect: (latitude: number, longitude: number) => void;
  selectedLabId: string | null;
};

type NearbyPlace = {
  address: string;
  lat: number;
  lng: number;
  mapsUrl: string;
  name: string;
  placeId: string;
  rating: number | null;
};

type MapMarker = {
  address: string;
  id: string;
  kind: "app" | "nearby";
  lat: number;
  lng: number;
  mapsUrl: string | null;
  matchedLab: PhotoLab | null;
  name: string;
  rating: number | null;
};

type SelectedPlace = {
  address: string;
  lat: number;
  lng: number;
  name: string;
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
};

const defaultZoom = 12;
const libraries: ("places")[] = ["places"];
const nearbyKeywordMap: Record<LabService, string> = {
  develop: "film developing lab",
  scan: "film scanning lab",
  prints: "photo printing lab",
  sameDay: "same day film lab",
};
const nycBounds = {
  east: -73.7004,
  north: 40.9176,
  south: 40.4774,
  west: -74.2591,
};

function buildGoogleMapsUrl(placeId: string) {
  return `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}`;
}

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function calculateDistanceMiles(
  left: { lat: number; lng: number },
  right: { lat: number; lng: number },
) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const deltaLat = toRadians(right.lat - left.lat);
  const deltaLng = toRadians(right.lng - left.lng);
  const lat1 = toRadians(left.lat);
  const lat2 = toRadians(right.lat);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return 2 * earthRadiusMiles * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isWithinNycBounds(lat: number, lng: number) {
  return (
    lat >= nycBounds.south &&
    lat <= nycBounds.north &&
    lng >= nycBounds.west &&
    lng <= nycBounds.east
  );
}

function searchNearbyPlaces(
  service: google.maps.places.PlacesService,
  keyword: string,
  location: { lat: number; lng: number },
) {
  return new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
    service.nearbySearch(
      {
        keyword,
        location,
        radius: 10000,
      },
      (results, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK ||
          status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS
        ) {
          resolve(results ?? []);
          return;
        }

        reject(new Error(status));
      },
    );
  });
}

function findMatchingLab(place: NearbyPlace, labs: PhotoLab[]) {
  const directMatch = labs.find(
    (lab) => lab.source === "google" && lab.sourceId === place.placeId,
  );

  if (directMatch) {
    return directMatch;
  }

  const normalizedPlaceName = normalizeName(place.name);

  return (
    labs.find((lab) => {
      const closeEnough =
        calculateDistanceMiles(place, lab.coordinates) <= 0.18;
      const sameName = normalizeName(lab.name) === normalizedPlaceName;

      return closeEnough && sameName;
    }) ?? null
  );
}

export function MapPanel({
  activeServices,
  activeLatitude,
  activeLongitude,
  detailSearch,
  labs,
  onPlaceSelect,
  selectedLabId,
}: MapPanelProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [liveSearchError, setLiveSearchError] = useState<string | null>(null);
  const [liveSearchLoading, setLiveSearchLoading] = useState(false);
  const [livePlaces, setLivePlaces] = useState<NearbyPlace[]>([]);
  const [highlightedMarkerId, setHighlightedMarkerId] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const nearbySearchRequestRef = useRef(0);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "",
    libraries,
  });

  const center = useMemo(() => {
    if (selectedPlace) {
      return { lat: selectedPlace.lat, lng: selectedPlace.lng };
    }

    if (activeLatitude !== null && activeLongitude !== null) {
      return { lat: activeLatitude, lng: activeLongitude };
    }

    return defaultCenter;
  }, [activeLatitude, activeLongitude, selectedPlace]);

  const nearbyKeywords = useMemo(() => {
    const requestedServices: LabService[] =
      activeServices.length > 0 ? activeServices : ["develop", "scan", "prints"];

    return Array.from(
      new Set(requestedServices.map((service) => nearbyKeywordMap[service])),
    );
  }, [activeServices]);

  const markerIcons = useMemo(() => {
    if (!isLoaded || !window.google) {
      return null;
    }

    return {
      app: {
        fillColor: "#0f766e",
        fillOpacity: 0.95,
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
      nearby: {
        fillColor: "#d97706",
        fillOpacity: 0.95,
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 7,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
    };
  }, [isLoaded]);

  const markers = useMemo(() => {
    const matchedLabIds = new Set<string>();
    const mergedMarkers = livePlaces.map((place) => {
      const matchedLab = findMatchingLab(place, labs);

      if (matchedLab) {
        matchedLabIds.add(matchedLab.id);
      }

      return {
        address: matchedLab?.address ?? place.address,
        id: matchedLab?.id ?? `nearby:${place.placeId}`,
        kind: matchedLab ? "app" : "nearby",
        lat: place.lat,
        lng: place.lng,
        mapsUrl: matchedLab?.mapsUrl ?? place.mapsUrl,
        matchedLab,
        name: matchedLab?.name ?? place.name,
        rating: matchedLab?.rating ?? place.rating,
      } satisfies MapMarker;
    });

    const appOnlyMarkers = labs
      .filter((lab) => !matchedLabIds.has(lab.id))
      .map((lab) => ({
        address: lab.address,
        id: lab.id,
        kind: "app" as const,
        lat: lab.coordinates.lat,
        lng: lab.coordinates.lng,
        mapsUrl: lab.mapsUrl,
        matchedLab: lab,
        name: lab.name,
        rating: lab.rating,
      }));

    return [...mergedMarkers, ...appOnlyMarkers];
  }, [labs, livePlaces]);

  const activeMarker = useMemo(
    () =>
      markers.find((marker) => marker.id === highlightedMarkerId) ??
      markers.find((marker) => marker.matchedLab?.id === selectedLabId) ??
      null,
    [highlightedMarkerId, markers, selectedLabId],
  );

  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const handleMapUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (!map) {
      return;
    }

    if (selectedPlace) {
      map.panTo({ lat: selectedPlace.lat, lng: selectedPlace.lng });
      map.setZoom(13);
      return;
    }

    if (activeLatitude !== null && activeLongitude !== null) {
      map.panTo({ lat: activeLatitude, lng: activeLongitude });
      map.setZoom(13);
      return;
    }

    if (markers.length === 0) {
      map.panTo(defaultCenter);
      map.setZoom(defaultZoom);
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    markers.forEach((marker) => {
      bounds.extend({
        lat: marker.lat,
        lng: marker.lng,
      });
    });
    map.fitBounds(bounds);
  }, [activeLatitude, activeLongitude, map, markers, selectedPlace]);

  useEffect(() => {
    if (!map || !selectedLabId) {
      return;
    }

    const lab = labs.find((item) => item.id === selectedLabId);

    if (!lab) {
      return;
    }

    map.panTo({
      lat: lab.coordinates.lat,
      lng: lab.coordinates.lng,
    });
  }, [labs, map, selectedLabId]);

  useEffect(() => {
    if (!map || !window.google?.maps?.places) {
      return;
    }

    const origin = selectedPlace
      ? { lat: selectedPlace.lat, lng: selectedPlace.lng }
      : activeLatitude !== null && activeLongitude !== null
        ? { lat: activeLatitude, lng: activeLongitude }
        : defaultCenter;

    if (!isWithinNycBounds(origin.lat, origin.lng)) {
      setLivePlaces([]);
      setLiveSearchError("Live map results are limited to New York City.");
      setLiveSearchLoading(false);
      return;
    }

    const requestId = ++nearbySearchRequestRef.current;
    const placesService = new window.google.maps.places.PlacesService(map);

    setLiveSearchLoading(true);
    setLiveSearchError(null);

    Promise.all(
      nearbyKeywords.map((keyword) =>
        searchNearbyPlaces(placesService, keyword, origin),
      ),
    )
      .then((resultSets) => {
        if (requestId !== nearbySearchRequestRef.current) {
          return;
        }

        const dedupedPlaces = new Map<string, NearbyPlace>();

        resultSets.flat().forEach((place) => {
          const placeId = place.place_id;
          const lat = place.geometry?.location?.lat();
          const lng = place.geometry?.location?.lng();

          if (!placeId || lat === undefined || lng === undefined) {
            return;
          }

          if (!isWithinNycBounds(lat, lng)) {
            return;
          }

          const mappedPlace = {
            address: place.vicinity ?? place.name ?? "",
            lat,
            lng,
            mapsUrl: buildGoogleMapsUrl(placeId),
            name: place.name ?? "Photo lab",
            placeId,
            rating: typeof place.rating === "number" ? place.rating : null,
          };

          const existing = dedupedPlaces.get(placeId);

          if (!existing || (mappedPlace.rating ?? 0) > (existing.rating ?? 0)) {
            dedupedPlaces.set(placeId, mappedPlace);
          }
        });

        const sortedPlaces = Array.from(dedupedPlaces.values())
          .sort((left, right) => {
            const distanceDelta =
              calculateDistanceMiles(origin, left) - calculateDistanceMiles(origin, right);

            if (Math.abs(distanceDelta) > 0.05) {
              return distanceDelta;
            }

            return (right.rating ?? 0) - (left.rating ?? 0);
          })
          .slice(0, 24);

        setLivePlaces(sortedPlaces);
        setLiveSearchLoading(false);
      })
      .catch(() => {
        if (requestId !== nearbySearchRequestRef.current) {
          return;
        }

        setLivePlaces([]);
        setLiveSearchLoading(false);
        setLiveSearchError("Google nearby search is unavailable right now.");
      });
  }, [activeLatitude, activeLongitude, map, nearbyKeywords, selectedPlace]);

  useEffect(() => {
    if (
      highlightedMarkerId &&
      !markers.some((marker) => marker.id === highlightedMarkerId)
    ) {
      setHighlightedMarkerId(null);
    }
  }, [highlightedMarkerId, markers]);

  function handleAutocompleteLoad(autocomplete: google.maps.places.Autocomplete) {
    autocompleteRef.current = autocomplete;
  }

  function handlePlacesChanged() {
    const place = autocompleteRef.current?.getPlace();

    if (!place) {
      return;
    }

    if (!place.geometry?.location) {
      return;
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setSelectedPlace({
      address: place.formatted_address ?? "",
      lat,
      lng,
      name: place.name ?? "Selected place",
    });
    setSearchValue(place.formatted_address ?? place.name ?? "");
    onPlaceSelect(lat, lng);

    if (map) {
      map.panTo({ lat, lng });
      map.setZoom(13);
    }
  }

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <section className="map-panel">
        <div className="map-panel__message">
          Google Maps needs `VITE_GOOGLE_MAPS_API_KEY` in `.env` before the map can load.
        </div>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="map-panel">
        <div className="map-panel__message">Failed to load Google Maps.</div>
      </section>
    );
  }

  if (!isLoaded) {
    return (
      <section className="map-panel">
        <div className="map-panel__message">Loading Google map...</div>
      </section>
    );
  }

  return (
    <section className="map-panel">
      <div className="map-panel__search">
        <Autocomplete
          onLoad={handleAutocompleteLoad}
          onPlaceChanged={handlePlacesChanged}
          options={{
            bounds: nycBounds,
            componentRestrictions: { country: "us" },
            fields: ["formatted_address", "geometry", "name"],
            strictBounds: true,
          }}
        >
          <input
            className="map-panel__input"
            type="text"
            placeholder="Search a neighborhood, ZIP, or lab"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </Autocomplete>
        <div className="map-panel__status">
          <span>
            {liveSearchLoading
              ? "Refreshing nearby Google markers..."
              : `${livePlaces.length} live nearby matches`}
          </span>
          <span>{labs.length} app records</span>
        </div>
        <p>Choose a place to recenter the map and load nearby photo labs across NYC.</p>
        {liveSearchError ? <p className="map-panel__alert">{liveSearchError}</p> : null}
      </div>

      <GoogleMap
        mapContainerClassName="map-panel__canvas"
        center={center}
        zoom={defaultZoom}
        onLoad={handleMapLoad}
        onUnmount={handleMapUnmount}
        options={{
          clickableIcons: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {selectedPlace ? (
          <Marker
            position={{
              lat: selectedPlace.lat,
              lng: selectedPlace.lng,
            }}
            title={selectedPlace.name}
          />
        ) : null}

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            icon={markerIcons ? markerIcons[marker.kind] : undefined}
            position={{ lat: marker.lat, lng: marker.lng }}
            title={marker.name}
            onClick={() => setHighlightedMarkerId(marker.id)}
          />
        ))}

        {activeMarker ? (
          <InfoWindow
            position={{
              lat: activeMarker.lat,
              lng: activeMarker.lng,
            }}
            onCloseClick={() => setHighlightedMarkerId(null)}
          >
            <div className="map-panel__popup">
              <strong>{activeMarker.name}</strong>
              {activeMarker.matchedLab ? (
                <>
                  <span>
                    {activeMarker.matchedLab.borough} · {activeMarker.matchedLab.neighborhood}
                  </span>
                  <span>
                    {activeMarker.matchedLab.services
                      .map((service) => serviceLabels[service])
                      .join(", ")}
                  </span>
                  <Link to={`/labs/${activeMarker.matchedLab.id}${detailSearch}`}>Open details</Link>
                </>
              ) : (
                <>
                  <span>{activeMarker.address}</span>
                  <span>
                    {activeMarker.rating !== null
                      ? `${activeMarker.rating.toFixed(1)} Google rating`
                      : "Live nearby Google result"}
                  </span>
                  {activeMarker.mapsUrl ? (
                    <a href={activeMarker.mapsUrl} rel="noreferrer" target="_blank">
                      Open in Google Maps
                    </a>
                  ) : null}
                </>
              )}
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </section>
  );
}
