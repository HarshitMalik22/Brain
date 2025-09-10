'use client';

import { useHydrationSafe } from '../hooks/useHydrationSafe';

interface HydrationGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function HydrationGuard({ children, fallback }: HydrationGuardProps) {
  const isHydrated = useHydrationSafe();

  if (!isHydrated) {
    return fallback || (
      <div 
        className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center" 
        suppressHydrationWarning
      >
        <div className="text-white text-xl" suppressHydrationWarning>
          Loading...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
