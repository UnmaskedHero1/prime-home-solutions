export const business = {
  name: "Prime Home Solutions LLC",
  owner: "Mr. Armas",
  role: "Owner",
  area: "Charlotte",
  phoneDisplay: "786-642-6484",
  phoneHref: "tel:+17866426484",
  email: "primesolutionsllc2026@gmail.com",
  tagline: "Quality work. Reliable service. Your satisfaction is our priority.",
  slogan: "One call. We do it all. Inside & out.",
};

export const serviceFamilies = [
  {
    name: "Pressure Washing",
    anchor: "#pressure-washing",
    options: [
      { audience: "Homes", detail: "Siding, driveways, walkways, and decks." },
      { audience: "Businesses", detail: "Storefronts, sidewalks, and parking areas." },
    ],
  },
  {
    name: "Painting",
    options: [
      { audience: "Homes", detail: "Interior and exterior paint for the house." },
      { audience: "Businesses", detail: "Offices, storefronts, and commercial spaces." },
    ],
  },
  {
    name: "Light Installation",
    anchor: "#lighting",
    options: [
      { audience: "Homes", detail: "Fixtures, ceiling lights, and outdoor lighting." },
      { audience: "Businesses", detail: "Lighting for shops, offices, and signs." },
    ],
  },
  {
    name: "Tree Trimming",
    options: [{ audience: "Homes", detail: "Trimming and shaping the trees around the house." }],
  },
];

export const serviceOptions = serviceFamilies.flatMap((family) =>
  family.options.map((option) => `${family.name} · ${option.audience}`)
);

// Set `before` and `after` to image paths once the pictures are uploaded.
// Files in databases/images/ are served at /images/<filename>,
// for example "/images/wash-home-before.jpg".
export const pressureWashing = [
  {
    title: "Homes",
    text: "Siding, concrete, and the film that builds up on a house.",
    before: null,
    after: null,
    beforeLabel: "Before photo · home",
    afterLabel: "After photo · home",
  },
  {
    title: "Businesses",
    text: "Storefronts, walkways, and the areas customers see first.",
    before: null,
    after: null,
    beforeLabel: "Before photo · business",
    afterLabel: "After photo · business",
  },
];

// Set `src` to an image path once the light installation pictures are added.
export const lighting = [
  {
    group: "Homes",
    items: [
      { stage: "During install", src: null },
      { stage: "After", src: null },
    ],
  },
  {
    group: "Businesses",
    items: [
      { stage: "During install", src: null },
      { stage: "After", src: null },
    ],
  },
];

export const landscaping = {
  path: "/landscaping",
  name: "Landscaping",
  audience: "Homes",
  intro:
    "Planting and tending the beds, shrubs, and plants around a Charlotte home. Call and say what the yard needs.",
  points: [
    "Planting beds, shrubs, and seasonal plants",
    "Tending plants and beds through the season",
    "Mulch, edging, and cleanup around the yard",
  ],
  photos: ["Planting photo", "Finished bed photo", "Seasonal upkeep photo"],
};

export const reviews = [
  {
    name: "Andrea",
    area: "Charlotte",
    service: "Pressure Washing · Homes",
    quote: "The siding and the driveway look like the house again. Easy to get on the phone.",
  },
  {
    name: "Marcus",
    area: "Charlotte",
    service: "Light Installation · Businesses",
    quote: "New lights in the shop went in clean, and the place is brighter for customers.",
  },
  {
    name: "Denise",
    area: "Charlotte",
    service: "Painting · Homes",
    quote: "He painted the bedrooms and the trim came out clean.",
  },
  {
    name: "Chris",
    area: "Charlotte",
    service: "Tree Trimming · Homes",
    quote: "The oaks were hanging over the roof. He trimmed them back and hauled everything off.",
  },
  {
    name: "Lauren",
    area: "Charlotte",
    service: "Pressure Washing · Businesses",
    quote: "The storefront sidewalk had years on it. One wash and it reads clean.",
  },
  {
    name: "James",
    area: "Charlotte",
    service: "Painting · Businesses",
    quote: "Office walls done over a weekend, no mess left behind.",
  },
];
