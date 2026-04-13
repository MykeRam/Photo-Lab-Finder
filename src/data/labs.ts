import type { LabService, PhotoLab } from "../types";

export const serviceLabels: Record<LabService, string> = {
  develop: "Develop",
  scan: "Scan",
  prints: "Prints",
  sameDay: "Same-Day",
};

export const labs: PhotoLab[] = [
  {
    id: "grain-house",
    name: "Grain House Lab",
    borough: "Brooklyn",
    neighborhood: "Williamsburg",
    address: "157 Kent Ave, Brooklyn, NY",
    description:
      "C-41 and black-and-white processing with clean Noritsu scans and dependable rush handling for client work.",
    services: ["develop", "scan", "sameDay"],
    turnaround: "same-day",
    priceTier: "$$",
    rating: 4.8,
    coordinates: { lat: 40.7184, lng: -73.9617 },
    imageUrl:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
    specialties: ["35mm", "120", "Push/Pull Processing"],
    hours: "Mon-Sat 10am-7pm",
  },
  {
    id: "silver-tone",
    name: "Silver Tone Imaging",
    borough: "Manhattan",
    neighborhood: "Lower East Side",
    address: "86 Orchard St, New York, NY",
    description:
      "Fast developing, contact sheets, and exhibition-grade print finishing for hybrid editorial workflows.",
    services: ["develop", "prints", "sameDay"],
    turnaround: "1-2 days",
    priceTier: "$$$",
    rating: 4.6,
    coordinates: { lat: 40.718, lng: -73.9903 },
    imageUrl:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80",
    specialties: ["Fine Art Prints", "Rush Orders", "Contact Sheets"],
    hours: "Tue-Sun 11am-8pm",
  },
  {
    id: "north-light",
    name: "North Light Lab",
    borough: "Queens",
    neighborhood: "Astoria",
    address: "31-18 31st St, Astoria, NY",
    description:
      "Reliable scans, archival sleeves, and clean order tracking for recurring neighborhood drop-offs.",
    services: ["develop", "scan"],
    turnaround: "2-3 days",
    priceTier: "$$",
    rating: 4.5,
    coordinates: { lat: 40.7624, lng: -73.9261 },
    imageUrl:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80",
    specialties: ["TIFF Delivery", "Archival Sleeves", "Medium Format"],
    hours: "Daily 9am-6pm",
  },
  {
    id: "mott-haven-color",
    name: "Mott Haven Color Lab",
    borough: "Bronx",
    neighborhood: "Mott Haven",
    address: "310 E 140th St, Bronx, NY",
    description:
      "Affordable developing and scanning with consistent turnaround windows for students and repeat shooters.",
    services: ["develop", "scan", "prints"],
    turnaround: "2-3 days",
    priceTier: "$",
    rating: 4.4,
    coordinates: { lat: 40.8116, lng: -73.9229 },
    imageUrl:
      "https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=1200&q=80",
    specialties: ["Budget C-41", "Index Scans", "4x6 Prints"],
    hours: "Mon-Fri 9am-6pm",
  },
  {
    id: "chelsea-contact",
    name: "Chelsea Contact",
    borough: "Manhattan",
    neighborhood: "Chelsea",
    address: "218 W 23rd St, New York, NY",
    description:
      "A polished pro lab for fast client selects, same-day scans, and presentation-ready short-run prints.",
    services: ["scan", "prints", "sameDay"],
    turnaround: "same-day",
    priceTier: "$$$",
    rating: 4.7,
    coordinates: { lat: 40.7454, lng: -73.9954 },
    imageUrl:
      "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80",
    specialties: ["Client Selects", "Same-Day Scans", "Short-Run Prints"],
    hours: "Mon-Sat 8am-7pm",
  },
  {
    id: "st-george-photo-works",
    name: "St. George Photo Works",
    borough: "Staten Island",
    neighborhood: "St. George",
    address: "25 Hyatt St, Staten Island, NY",
    description:
      "Neighborhood lab with attentive developing notes, practical print packages, and easy pickup windows.",
    services: ["develop", "prints"],
    turnaround: "4-7 days",
    priceTier: "$",
    rating: 4.2,
    coordinates: { lat: 40.6433, lng: -74.0743 },
    imageUrl:
      "https://images.unsplash.com/photo-1520390138845-fd2d229dd553?auto=format&fit=crop&w=1200&q=80",
    specialties: ["Developing Notes", "Pickup Orders", "Print Packages"],
    hours: "Wed-Sun 10am-5pm",
  },
];
