import { useState, useEffect } from 'react';

export function useHydrationSafe() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // This ensures we only render on the client side after hydration is complete
    setIsHydrated(true);
  }, []);

  return isHydrated;
}
