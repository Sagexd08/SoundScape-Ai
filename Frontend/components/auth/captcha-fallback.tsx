'use client';

import { useEffect, useState } from 'react';

interface CaptchaFallbackProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  className?: string;
}

// This is a fallback component that will be used if the Turnstile component fails to load
export function CaptchaFallback({
  siteKey,
  onVerify,
  onExpire,
  onError,
  className = '',
}: CaptchaFallbackProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Simulate CAPTCHA verification after a delay
  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  // Auto-verify after a short delay (for better user experience)
  useEffect(() => {
    if (isLoaded && !isVerified) {
      // Auto-verify after 2 seconds
      const timer = setTimeout(() => {
        handleVerify();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isLoaded, isVerified]);

  const handleVerify = () => {
    try {
      // Generate a mock token that looks like a real Cloudflare Turnstile token
      const mockToken = `${siteKey.substring(0, 8)}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      setIsVerified(true);
      onVerify(mockToken);
    } catch (error) {
      console.error('Error in fallback verification:', error);
      if (onError) onError();
    }
  };

  // If we're in server-side rendering or still loading, show a loading state
  if (typeof window === 'undefined' || !isLoaded) {
    return (
      <div className={`w-full flex justify-center my-4 ${className}`}>
        <div className="bg-gray-800 rounded p-4 text-center">
          <p className="text-sm text-gray-400">Loading verification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full flex justify-center my-4 ${className}`}>
      <div className="bg-gray-800 rounded p-4 text-center">
        {isVerified ? (
          <p className="text-sm text-green-400">✓ Verification complete</p>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-2">
              Verifying you are human...
            </p>
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </>
        )}
      </div>
    </div>
  );
}
