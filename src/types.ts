export type LabService = "develop" | "scan" | "prints" | "sameDay";

export type Turnaround = "same-day" | "1-2 days" | "2-3 days" | "4-7 days";

export type NoteMap = Record<string, string>;

export type LabSource = "google";

export type LabSearchInput = {
  query: string;
  services: LabService[];
  latitude: number | null;
  longitude: number | null;
};

export type LabSearchResponse = {
  labs: PhotoLab[];
  provider: LabSource;
};

export type NearbyMapPlace = {
  address: string;
  imageUrl: string | null;
  id: string;
  lat: number;
  lng: number;
  mapsUrl: string;
  matchedLabId: string | null;
  name: string;
  photoAttributions: string[];
  rating: number | null;
};

export type PhotoLab = {
  id: string;
  source: LabSource;
  sourceId: string;
  sourceLabel: string;
  name: string;
  borough: string;
  neighborhood: string;
  address: string;
  description: string;
  services: LabService[];
  turnaround: Turnaround;
  priceTier: "$" | "$$" | "$$$";
  rating: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  distanceMiles: number | null;
  imageUrl: string | null;
  specialties: string[];
  hours: string;
  website: string | null;
  mapsUrl: string | null;
  phone: string | null;
};
