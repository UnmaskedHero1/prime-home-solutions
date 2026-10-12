import { createContext, useContext, useEffect, useState } from "react";

const empty = { slots: {}, photos: [] };
const GalleryContext = createContext(empty);

export function GalleryProvider({ children }) {
  const [gallery, setGallery] = useState(empty);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/gallery")
      .then((response) => (response.ok ? response.json() : empty))
      .then((data) => {
        if (!cancelled) setGallery({ slots: data?.slots || {}, photos: data?.photos || [] });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return <GalleryContext.Provider value={gallery}>{children}</GalleryContext.Provider>;
}

export function useGallery() {
  return useContext(GalleryContext);
}

// Resolve a photo spot: the admin upload wins, then the default that ships
// with the site, otherwise null (the page shows a placeholder).
export function resolvePhoto(slots, photo) {
  if (!photo) return null;
  return slots[photo.slot] || photo.src || null;
}

export function usePhoto(photo) {
  const { slots } = useContext(GalleryContext);
  return resolvePhoto(slots, photo);
}
