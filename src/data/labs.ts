import type { PhotoLab } from "../types";

export const labs: PhotoLab[] = [
  {
    id: "grain-house",
    name: "Grain House Lab",
    city: "Brooklyn",
    region: "NY",
    neighborhood: "Williamsburg",
    description:
      "C-41, black-and-white, and rich Noritsu scans with optional rush handling for client work.",
    services: ["filmDeveloping", "scanning", "sameDay"],
    turnaround: "same-day",
    priceTier: "$$",
    rating: 4.8,
    distanceMiles: 1.2,
    imageUrl:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "silver-tone",
    name: "Silver Tone Imaging",
    city: "Manhattan",
    region: "NY",
    neighborhood: "Lower East Side",
    description:
      "Fast 35mm developing, contact sheets, and exhibition-grade print finishing for hybrid workflows.",
    services: ["filmDeveloping", "prints", "sameDay"],
    turnaround: "1-2 days",
    priceTier: "$$$",
    rating: 4.6,
    distanceMiles: 3.9,
    imageUrl:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "north-light",
    name: "North Light Lab",
    city: "Queens",
    region: "NY",
    neighborhood: "Astoria",
    description:
      "Reliable scans, archival sleeves, and simple online drop-off tracking for recurring lab runs.",
    services: ["filmDeveloping", "scanning", "mailIn"],
    turnaround: "3-5 days",
    priceTier: "$$",
    rating: 4.5,
    distanceMiles: 6.1,
    imageUrl:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "daylight-post",
    name: "Daylight Post",
    city: "Jersey City",
    region: "NJ",
    neighborhood: "Downtown",
    description:
      "Mail-in processing with careful packaging, medium-format support, and consistent turnaround windows.",
    services: ["filmDeveloping", "scanning", "mailIn"],
    turnaround: "1 week+",
    priceTier: "$",
    rating: 4.4,
    distanceMiles: 7.8,
    imageUrl:
      "https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "color-run",
    name: "Color Run Photo Lab",
    city: "Long Island City",
    region: "NY",
    neighborhood: "Hunters Point",
    description:
      "High-volume scanning, quick contact delivery, and dependable same-day options for agency teams.",
    services: ["scanning", "prints", "sameDay"],
    turnaround: "same-day",
    priceTier: "$$",
    rating: 4.7,
    distanceMiles: 4.4,
    imageUrl:
      "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "harbor-chemistry",
    name: "Harbor Chemistry",
    city: "Hoboken",
    region: "NJ",
    neighborhood: "Waterfront",
    description:
      "Film developing with attentive push/pull notes, crisp TIFF delivery, and print-ready export sets.",
    services: ["filmDeveloping", "scanning", "prints"],
    turnaround: "1-2 days",
    priceTier: "$$",
    rating: 4.3,
    distanceMiles: 8.5,
    imageUrl:
      "https://images.unsplash.com/photo-1520390138845-fd2d229dd553?auto=format&fit=crop&w=1200&q=80",
  },
];

export const serviceLabels: Record<string, string> = {
  filmDeveloping: "Film Developing",
  scanning: "Scanning",
  prints: "Prints",
  mailIn: "Mail-In",
  sameDay: "Same-Day",
};
