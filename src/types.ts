export type LabService =
  | "filmDeveloping"
  | "scanning"
  | "prints"
  | "mailIn"
  | "sameDay";

export type Turnaround = "same-day" | "1-2 days" | "3-5 days" | "1 week+";

export type PhotoLab = {
  id: string;
  name: string;
  city: string;
  region: string;
  neighborhood: string;
  description: string;
  services: LabService[];
  turnaround: Turnaround;
  priceTier: "$" | "$$" | "$$$";
  rating: number;
  distanceMiles: number;
  imageUrl: string;
};
