import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  GoogleMap,
  InfoWindow,
  Marker,
  StandaloneSearchBox,
  useJsApiLoader,
} from "@react-google-maps/api";
import { serviceLabels } from "../data/labs";
import type { PhotoLab } from "../types";
import "./MapPanel.css";

type MapPanelProps = {
  activeLatitude: number | null;
  activeLongitude: number | null;
  detailSearch: string;
  labs: PhotoLab[];
  onPlaceSelect: (latitude: number, longitude: number) => void;
  selectedLabId: string | null;
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

const libraries: ("places")[] = ["places"];

export function MapPanel({
  activeLatitude,
  activeLongitude,
  detailSearch,
  labs,
  onPlaceSelect,
  selectedLabId,
}: MapPanelProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [highlightedLabId, setHighlightedLabId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);

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

  const highlightedLab = useMemo(
    () => labs.find((lab) => lab.id === (highlightedLabId ?? selectedLabId)) ?? null,
    [highlightedLabId, labs, selectedLabId],
  );

  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const handleMapUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (!map || labs.length === 0) {
      return;
    }

    if (activeLatitude !== null && activeLongitude !== null) {
      map.panTo({ lat: activeLatitude, lng: activeLongitude });
      map.setZoom(13);
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    labs.forEach((lab) => {
      bounds.extend({
        lat: lab.coordinates.lat,
        lng: lab.coordinates.lng,
      });
    });
    map.fitBounds(bounds);
  }, [activeLatitude, activeLongitude, labs, map]);

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

  function handleSearchBoxLoad(searchBox: google.maps.places.SearchBox) {
    searchBoxRef.current = searchBox;
  }

  function handlePlacesChanged() {
    const places = searchBoxRef.current?.getPlaces();

    if (!places || places.length === 0) {
      return;
    }

    const place = places[0];

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
        <StandaloneSearchBox onLoad={handleSearchBoxLoad} onPlacesChanged={handlePlacesChanged}>
          <input
            className="map-panel__input"
            type="text"
            placeholder="Search a neighborhood, ZIP, or lab"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </StandaloneSearchBox>
        <p>Choose a place to recenter the map and load nearby photo labs.</p>
      </div>

      <GoogleMap
        mapContainerClassName="map-panel__canvas"
        center={center}
        zoom={12}
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

        {labs.map((lab) => (
          <Marker
            key={lab.id}
            position={{ lat: lab.coordinates.lat, lng: lab.coordinates.lng }}
            title={lab.name}
            onClick={() => setHighlightedLabId(lab.id)}
          />
        ))}

        {highlightedLab ? (
          <InfoWindow
            position={{
              lat: highlightedLab.coordinates.lat,
              lng: highlightedLab.coordinates.lng,
            }}
            onCloseClick={() => setHighlightedLabId(null)}
          >
            <div className="map-panel__popup">
              <strong>{highlightedLab.name}</strong>
              <span>
                {highlightedLab.borough} · {highlightedLab.neighborhood}
              </span>
              <span>{highlightedLab.services.map((service) => serviceLabels[service]).join(", ")}</span>
              <Link to={`/labs/${highlightedLab.id}${detailSearch}`}>Open details</Link>
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </section>
  );
}
