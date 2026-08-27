import type { Listing } from "../models/listing";

export const listings: Listing[] = [
  {
    id: 1,
    title: "Leica M6 TTL Black",
    price: 2400,
    category: "Photography",
    condition: "Excellent",
    seller: "K. Nakamura",
    images: [
      "photo-1606983340126-99ab4feaa64a",
      "photo-1495704908510-27d9980ed3cb",
      "photo-1452780212940-6f5c0d16d619",
    ],
    location: "Tokyo, JP",
    description:
      "Black chrome Leica M6 TTL with the 0.72 finder. Shutter is even across all speeds, rangefinder patch is bright, and the vulcanite is original with honest wear at the edges. Recently CLA'd in Tokyo — light seals replaced, viewfinder cleaned. Body only; no lens, strap, or box.",
    tags: ["rangefinder", "film", "leica", "analog"],
    parameters: [
      { name: "Brand", value: "Leica" },
      { name: "Model", value: "M6 TTL" },
      { name: "Year", value: "1998" },
      { name: "Finder", value: "0.72×" },
      { name: "Shutter", value: "1–1/1000 + B" },
      { name: "Serial", value: "2471821" },
    ],
    listedAt: "Aug 12, 2026",
    stock: 1,
    sellerRating: 4.9,
    sellerSales: 86,
  },
  {
    id: 2,
    title: "Arc'teryx Beta AR Jacket",
    price: 380,
    category: "Clothing",
    condition: "Like New",
    seller: "T. Berg",
    images: [
      "photo-1551698618-1dfe5d97d256",
      "photo-1521223890158-b9eb0cf5cc73",
      "photo-1483985988355-763728e1935b",
    ],
    location: "Oslo, NO",
    description:
      "Men's Beta AR in Black Sapphire, size M. Worn twice on spring tours, then stored. No delamination, no snags, pit zips run clean. Gore-Tex Pro face still beads water. From a smoke-free home; includes original stuff sack.",
    tags: ["gore-tex", "shell", "outdoor", "arcteryx"],
    parameters: [
      { name: "Brand", value: "Arc'teryx" },
      { name: "Model", value: "Beta AR" },
      { name: "Size", value: "M" },
      { name: "Color", value: "Black Sapphire" },
      { name: "Fabric", value: "Gore-Tex Pro" },
      { name: "Fit", value: "Regular" },
    ],
    listedAt: "Aug 18, 2026",
    stock: 1,
    sellerRating: 5.0,
    sellerSales: 24,
  },
  {
    id: 3,
    title: "Braun T3 Alarm Clock",
    price: 180,
    category: "Home",
    condition: "Good",
    seller: "M. Weiss",
    images: [
      "photo-1563861826100-9cb868fdbe1c",
      "photo-1510511459019-5dda7724ec03",
      "photo-1507473885765-e6ed057f782c",
    ],
    location: "Berlin, DE",
    description:
      "Dietrich Lubs T3 in working order. Alarm, snooze, and light function as they should. Case has light scuffing on the rear corners; face is clean with no yellowing. Runs on a fresh AA. A small, considered object — not a reproduction.",
    tags: ["braun", "design", "alarm", "vintage"],
    parameters: [
      { name: "Brand", value: "Braun" },
      { name: "Model", value: "T3" },
      { name: "Designer", value: "Dietrich Lubs" },
      { name: "Origin", value: "Germany" },
      { name: "Power", value: "1× AA" },
      { name: "Dimensions", value: "61 × 61 × 61 mm" },
    ],
    listedAt: "Aug 04, 2026",
    stock: 1,
    sellerRating: 4.8,
    sellerSales: 41,
  },
  {
    id: 4,
    title: "Technics SL-1200 MK5",
    price: 1200,
    category: "Electronics",
    condition: "Good",
    seller: "D. Okafor",
    images: [
      "photo-1558618666-fcd25c85cd64",
      "photo-1571330735066-03aaa9429d89",
      "photo-1493225457124-a3eb161ffa5f",
    ],
    location: "Lagos, NG",
    description:
      "Silver MK5, fully functional. Pitch is stable, brake is snappy, and the tonearm bearings are quiet. Plinth has rack rash on the rear left corner; dust cover has two small hairline scratches. Includes original headshell (no cartridge), RCA cables, and grounded power cord. 220–240V.",
    tags: ["turntable", "dj", "technics", "vinyl"],
    parameters: [
      { name: "Brand", value: "Technics" },
      { name: "Model", value: "SL-1200 MK5" },
      { name: "Drive", value: "Direct drive" },
      { name: "Speed", value: "33⅓ / 45 RPM" },
      { name: "Voltage", value: "220–240V" },
      { name: "Includes", value: "Headshell, cables, dust cover" },
    ],
    listedAt: "Jul 29, 2026",
    stock: 1,
    sellerRating: 4.7,
    sellerSales: 19,
  },
  {
    id: 5,
    title: "Hasselblad 500C/M",
    price: 1800,
    category: "Photography",
    condition: "Good",
    seller: "L. Chen",
    images: [
      "photo-1516035069371-29a1b244cc32",
      "photo-1502920917128-1aa500764b4a",
      "photo-1452780212940-6f5c0d16d619",
    ],
    location: "Shanghai, CN",
    description:
      "Chrome 500C/M body with Acute-Matte screen. Mirror and aux shutter fire cleanly; winding is smooth with no hang-ups. Leatherette is intact with brassing on the winding crank. Body only — no back, finder, or lens. Cosmetics consistent with a working kit, not a shelf piece.",
    tags: ["medium format", "hasselblad", "film", "v-system"],
    parameters: [
      { name: "Brand", value: "Hasselblad" },
      { name: "Model", value: "500C/M" },
      { name: "Format", value: "6×6" },
      { name: "Screen", value: "Acute-Matte" },
      { name: "Finish", value: "Chrome" },
      { name: "Includes", value: "Body only" },
    ],
    listedAt: "Aug 09, 2026",
    stock: 1,
    sellerRating: 4.9,
    sellerSales: 33,
  },
  {
    id: 6,
    title: "Levi's 501 1988",
    price: 220,
    category: "Clothing",
    condition: "Vintage",
    seller: "A. Perez",
    images: [
      "photo-1542272604-787c3835535d",
      "photo-1541099649105-f69ad21f3246",
      "photo-1582552938357-32b906df40cb",
    ],
    location: "NYC, US",
    description:
      "1988 501s with a high rise and a straight leg that has worn in, not out. Red tab, care tag, and button fly all present. Fading is even; one coin-pocket repair done with matching thread. Measured flat: 32\" waist, 32\" inseam. Washed once after purchase, hung dry.",
    tags: ["denim", "levis", "501", "vintage"],
    parameters: [
      { name: "Brand", value: "Levi's" },
      { name: "Model", value: "501" },
      { name: "Year", value: "1988" },
      { name: "Waist", value: "32\"" },
      { name: "Inseam", value: "32\"" },
      { name: "Rise", value: "High" },
    ],
    listedAt: "Aug 01, 2026",
    stock: 1,
    sellerRating: 4.6,
    sellerSales: 57,
  },
  {
    id: 7,
    title: "Sony WH-1000XM5",
    price: 280,
    category: "Electronics",
    condition: "Like New",
    seller: "J. Smith",
    images: [
      "photo-1618366712010-f4ae9c647dcb",
      "photo-1545127398-14699f92334b",
      "photo-1484704849700-f032a568e944",
    ],
    location: "London, UK",
    description:
      "Black XM5s used for two months of commuting. Pads and headband are unmarked; ANC and transparency work as expected. Battery still reports a full 30-hour cycle. Includes case, USB-C cable, and 3.5mm adapter. Factory reset before shipping.",
    tags: ["headphones", "anc", "sony", "wireless"],
    parameters: [
      { name: "Brand", value: "Sony" },
      { name: "Model", value: "WH-1000XM5" },
      { name: "Color", value: "Black" },
      { name: "Connectivity", value: "Bluetooth 5.2" },
      { name: "Battery", value: "Up to 30 hours" },
      { name: "Includes", value: "Case, cable, adapter" },
    ],
    listedAt: "Aug 20, 2026",
    stock: 1,
    sellerRating: 4.8,
    sellerSales: 12,
  },
  {
    id: 8,
    title: "Aesop Departure Kit",
    price: 95,
    category: "Beauty",
    condition: "New",
    seller: "S. Kim",
    images: [
      "photo-1556228453-efd6c1ff04f6",
      "photo-1571781926291-c477ebfd024b",
      "photo-1556228720-195a672e8a03",
    ],
    location: "Seoul, KR",
    description:
      "Unopened Departure Kit in the original sleeve. Includes Resurrection Rinse-Free Hand Wash, geranium leaf body cleanser, and mandarin facial cream — travel sizes, still sealed. Purchased as a gift and never used. No dents to the tin.",
    tags: ["aesop", "travel", "grooming", "sealed"],
    parameters: [
      { name: "Brand", value: "Aesop" },
      { name: "Set", value: "Departure Kit" },
      { name: "Status", value: "Sealed" },
      { name: "Pieces", value: "3" },
      { name: "Vessel", value: "Tin" },
      { name: "Origin", value: "Australia" },
    ],
    listedAt: "Aug 22, 2026",
    stock: 3,
    sellerRating: 5.0,
    sellerSales: 64,
  },
  {
    id: 9,
    title: "Olympus OM-1 Chrome",
    price: 320,
    category: "Photography",
    condition: "Good",
    seller: "R. Tanaka",
    images: [
      "photo-1502920917128-1aa500764b4a",
      "photo-1516035069371-29a1b244cc32",
      "photo-1606983340126-99ab4feaa64a",
    ],
    location: "Kyoto, JP",
    description:
      "Early chrome OM-1 with a bright finder and an accurate meter (1.5V zinc-air adapter installed). Shutter is even; mirror foam has been replaced. Light brassing on the baseplate and rewind crank. Body only, cap included. A compact SLR that still earns its keep.",
    tags: ["slr", "olympus", "film", "om-system"],
    parameters: [
      { name: "Brand", value: "Olympus" },
      { name: "Model", value: "OM-1" },
      { name: "Finish", value: "Chrome" },
      { name: "Shutter", value: "1–1/1000 + B" },
      { name: "Meter", value: "Working (1.5V adapter)" },
      { name: "Includes", value: "Body cap" },
    ],
    listedAt: "Aug 07, 2026",
    stock: 1,
    sellerRating: 4.9,
    sellerSales: 28,
  },
];

export function getListingById(id: string | undefined) {
  if (!id) {
    return undefined;
  }

  const numericId = Number(id);
  if (!Number.isInteger(numericId)) {
    return undefined;
  }

  return listings.find((listing) => listing.id === numericId);
}

export function getTrendingListings() {
  return listings.slice(0, 4);
}

export function getRelatedListings(listing: Listing, limit = 4) {
  const sameCategory = listings.filter(
    (item) => item.category === listing.category && item.id !== listing.id,
  );

  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }

  const remaining = listings.filter(
    (item) =>
      item.id !== listing.id &&
      !sameCategory.some((related) => related.id === item.id),
  );

  return [...sameCategory, ...remaining].slice(0, limit);
}
