'use client';

import { useEffect, useState } from 'react';
import { CaptchaFallback } from './captcha-fallback';

interface CaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  className?: string;
}

export function Captcha({
  siteKey,
  onVerify,
  onExpire,
  onError,
  className = '',
}: CaptchaProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [Turnstile, setTurnstile] = useState<any>(null);

  // Load the Turnstile component on the client side only
  useEffect(() => {
    setIsMounted(true);

    // Try to import the Turnstile component
    import('react-turnstile')
      .then((mod) => {
        setTurnstile(() => mod.Turnstile);
      })
      .catch((error) => {
        console.error('Failed to load Turnstile:', error);
        setHasError(true);
        if (onError) onError();
      });
  }, [onError]);

  // Handle errors with the Turnstile component
  const handleError = () => {
    setHasError(true);
    if (onError) onError();
  };

  // If there's an error loading the Turnstile component, use the fallback
  if (hasError || !isMounted) {
    return (
      <CaptchaFallback
        siteKey={siteKey}
        onVerify={onVerify}
        onExpire={onExpire}
        onError={onError}
        className={className}
      />
    );
  }

  // If Turnstile is not loaded yet, show loading state
  if (!Turnstile) {
    return (
      <div className={`w-full flex justify-center my-4 ${className}`}>
        <div className="bg-gray-800 rounded p-4 text-center">
          <p className="text-sm text-gray-400">Loading CAPTCHA verification...</p>
        </div>
      </div>
    );
  }

  // Render the Turnstile component
  return (
    <div className={`w-full flex justify-center my-4 ${className}`}>
      <Turnstile
        sitekey={siteKey}
        onVerify={onVerify}
        onExpire={onExpire}
        onError={handleError}
        theme="dark"
        size="normal"
      />
    </div>
  );
}
