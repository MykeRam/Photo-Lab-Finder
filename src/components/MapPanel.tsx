import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { latLngBounds } from "leaflet";
import { serviceLabels } from "../data/labs";
import type { PhotoLab } from "../types";
import "./MapPanel.css";

type MapPanelProps = {
  detailSearch: string;
  labs: PhotoLab[];
  selectedLabId: string | null;
};

function FitToResults({ labs }: { labs: PhotoLab[] }) {
  const map = useMap();

  useEffect(() => {
    if (labs.length === 0) {
      return;
    }

    const bounds = latLngBounds(labs.map((lab) => [lab.coordinates.lat, lab.coordinates.lng]));
    map.fitBounds(bounds, {
      padding: [28, 28],
      maxZoom: 13,
    });
  }, [labs, map]);

  return null;
}

function FocusSelectedLab({
  labs,
  selectedLabId,
}: {
  labs: PhotoLab[];
  selectedLabId: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedLabId) {
      return;
    }

    const lab = labs.find((item) => item.id === selectedLabId);

    if (!lab) {
      return;
    }

    map.flyTo([lab.coordinates.lat, lab.coordinates.lng], 13, {
      duration: 0.6,
    });
  }, [labs, map, selectedLabId]);

  return null;
}

export function MapPanel({ detailSearch, labs, selectedLabId }: MapPanelProps) {
  return (
    <MapContainer
      center={[40.73061, -73.935242]}
      className="map-panel"
      scrollWheelZoom={false}
      zoom={11}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitToResults labs={labs} />
      <FocusSelectedLab labs={labs} selectedLabId={selectedLabId} />

      {labs.map((lab) => (
        <Marker key={lab.id} position={[lab.coordinates.lat, lab.coordinates.lng]}>
          <Popup>
            <div className="map-panel__popup">
              <strong>{lab.name}</strong>
              <span>
                {lab.borough} · {lab.neighborhood}
              </span>
              <span>{lab.services.map((service) => serviceLabels[service]).join(", ")}</span>
              <Link to={`/labs/${lab.id}${detailSearch}`}>Open details</Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
