// Which side you're on (coach or tutor). Chosen at the landing, persisted for the
// session, and used to theme the app and swap vocabulary. Setting it also points
// the data store at that side's dataset.
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getBrand } from '../lib/brands';
import { setMode } from '../data/store';

const BrandContext = createContext(null);
const KEY = 'coachcast.brand';

export function BrandProvider({ children }) {
  const [brandId, setBrandId] = useState(() => {
    try {
      return sessionStorage.getItem(KEY) || null;
    } catch {
      return null;
    }
  });

  // keep the store pointed at the active side (covers reloads)
  useEffect(() => {
    if (brandId) setMode(brandId);
  }, [brandId]);

  const chooseBrand = useCallback((id) => {
    try {
      sessionStorage.setItem(KEY, id);
    } catch {
      // ignore
    }
    setMode(id);
    setBrandId(id);
  }, []);

  const clearBrand = useCallback(() => {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      // ignore
    }
    setBrandId(null);
  }, []);

  const brand = brandId ? getBrand(brandId) : null;

  return (
    <BrandContext.Provider value={{ brand, brandId, chooseBrand, clearBrand }}>
      {children}
    </BrandContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook co-located with provider (the seam)
export function useBrand() {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error('useBrand must be used within BrandProvider');
  return ctx;
}
