export type LabService = "develop" | "scan" | "prints" | "sameDay";

export type Turnaround = "same-day" | "1-2 days" | "2-3 days" | "4-7 days";

export type ViewMode = "cards" | "map";

export type NoteMap = Record<string, string>;

export type PhotoLab = {
  id: string;
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
  imageUrl: string;
  specialties: string[];
  hours: string;
};
