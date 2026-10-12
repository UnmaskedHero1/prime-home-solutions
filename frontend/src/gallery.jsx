import { createContext, useContext, useEffect, useState } from "react";

const GalleryContext = createContext({});

export function GalleryProvider({ children }) {
  const [gallery, setGallery] = useState({});

  useEffect(() => {
    let cancelled = false;
    fetch("/api/gallery")
      .then((response) => (response.ok ? response.json() : {}))
      .then((data) => {
        if (!cancelled) setGallery(data || {});
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return <GalleryContext.Provider value={gallery}>{children}</GalleryContext.Provider>;
}

export function usePhoto(photo) {
  const gallery = useContext(GalleryContext);
  if (!photo) return null;
  return gallery[photo.slot] || photo.src || null;
}
