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
    anchor: "#painting",
    options: [
      { audience: "Homes", detail: "Interior and exterior paint for the house." },
      { audience: "Businesses", detail: "Offices, storefronts, and commercial spaces." },
    ],
  },
  {
    name: "Light Installation",
    anchor: "#lights-and-trees",
    options: [
      { audience: "Homes", detail: "Fixtures, ceiling lights, and outdoor lighting." },
      { audience: "Businesses", detail: "Lighting for shops, offices, and signs." },
    ],
  },
  {
    name: "Tree Trimming",
    anchor: "#lights-and-trees",
    options: [{ audience: "Homes", detail: "Trimming and shaping the trees around the house." }],
  },
];

export const serviceOptions = serviceFamilies.flatMap((family) =>
  family.options.map((option) => `${family.name} · ${option.audience}`)
);

// Each photo spot has a `slot` (what the /admin page uploads into) and an
// optional `src` default that ships with the site. An admin upload wins.
export const comparisons = {
  "pressure-washing": [
    {
      title: "Homes",
      text: "A front walkway, before and after a wash.",
      before: { slot: "pressure-washing-homes-before", src: "/photos/pressure-washing-homes-before.jpg" },
      after: { slot: "pressure-washing-homes-after", src: "/photos/pressure-washing-homes-after.jpg" },
    },
    {
      title: "Businesses",
      text: "Storefronts, walkways, and the areas customers see first.",
      before: { slot: "pressure-washing-businesses-before" },
      after: { slot: "pressure-washing-businesses-after" },
    },
  ],
  painting: [
    {
      title: "Homes",
      text: "Interior and exterior paint for the house.",
      before: { slot: "painting-homes-before" },
      after: { slot: "painting-homes-after" },
    },
    {
      title: "Businesses",
      text: "A commercial wall finished in a textured plaster look.",
      before: { slot: "painting-businesses-before" },
      after: { slot: "painting-businesses-after", src: "/photos/painting-businesses-after.jpg" },
    },
  ],
};

export const singles = [
  {
    title: "Light Installation",
    audience: "Homes",
    text: "An outdoor fixture going in beside the garage.",
    photo: { slot: "light-installation-homes", src: "/photos/light-installation-homes.jpg" },
  },
  {
    title: "Light Installation",
    audience: "Businesses",
    text: "Lighting for shops, offices, and signs.",
    photo: { slot: "light-installation-businesses" },
  },
  {
    title: "Tree Trimming",
    audience: "Homes",
    text: "Limbs cut back from the roofline.",
    photo: { slot: "tree-trimming-homes", src: "/photos/tree-trimming-homes.jpg" },
  },
];

export const ownerPhoto = { slot: "owner", src: "/photos/owner.jpg" };

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
  photos: [
    { label: "Setting a new bed along the walk", photo: { slot: "landscaping-1", src: "/photos/landscaping-1.jpg" } },
    { label: "Finished bed photo", photo: { slot: "landscaping-2" } },
    { label: "Seasonal upkeep photo", photo: { slot: "landscaping-3" } },
  ],
};

// Every work photo spot on the home page, in page order, with a caption for
// the gallery. The owner portrait and the hidden landscaping page are left out.
export const sitePhotos = [
  ...Object.entries(comparisons).flatMap(([key, items]) =>
    items.flatMap((item) => {
      const family = key === "pressure-washing" ? "Pressure Washing" : "Painting";
      return [
        { photo: item.before, caption: `${family} · ${item.title} · Before` },
        { photo: item.after, caption: `${family} · ${item.title} · After` },
      ];
    })
  ),
  ...singles.map((item) => ({ photo: item.photo, caption: `${item.title} · ${item.audience}` })),
];

// Default image for each slot (what the site shows when nothing is uploaded).
export const defaultPhotos = Object.fromEntries(
  [...sitePhotos.map((item) => item.photo), ...landscaping.photos.map((item) => item.photo), ownerPhoto]
    .filter((photo) => photo.src)
    .map((photo) => [photo.slot, photo.src])
);

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
