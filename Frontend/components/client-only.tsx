'use client';

import React, { useEffect, useState, ReactNode, useMemo } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A wrapper component that ensures client-side only rendering with consistent hook execution
 * to prevent React Error #310 (Rendered more hooks than during the previous render).
 *
 * This component always renders a consistent number of hooks regardless of the mounted state,
 * which prevents hook count mismatches between renders.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  // Always declare the state hook, regardless of whether we're mounted or not
  const [isMounted, setIsMounted] = useState(false);

  // Use useMemo to ensure consistent hook count
  const memoizedValue = useMemo(() => ({ value: 'consistent' }), []);

  // Always use the effect hook, regardless of whether we're mounted or not
  useEffect(() => {
    // Set mounted state in useEffect to ensure it only happens client-side
    setIsMounted(true);

    return () => {
      // Cleanup function is always defined for consistency
      setIsMounted(false);
    };
  }, []);

  // Use a second effect to ensure consistent hook count between server and client
  useEffect(() => {
    // This empty effect ensures the hook count is consistent
    // It's important for preventing React Error #310
  }, [memoizedValue]);

  // Return children or fallback based on mounted state
  // This ensures the component tree structure is consistent
  return <>{isMounted ? children : fallback}</>;
}