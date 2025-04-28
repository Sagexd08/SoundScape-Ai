'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { CaptchaFallback } from './captcha-fallback';

// Dynamically import the Turnstile component with error handling
const TurnstileComponent = dynamic(
  () => import('react-turnstile').then((mod) => mod.Turnstile),
  {
    ssr: false,
    loading: () => (
      <div className="bg-gray-800 rounded p-4 text-center">
        <p className="text-sm text-gray-400">Loading CAPTCHA verification...</p>
      </div>
    ),
  }
);

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
  const turnstileRef = useRef<any>(null);
  const [hasError, setHasError] = useState(false);

  // Reset the CAPTCHA when the component unmounts
  useEffect(() => {
    return () => {
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
    };
  }, []);

  // Handle errors with the Turnstile component
  const handleError = () => {
    setHasError(true);
    if (onError) onError();
  };

  // If there's an error loading the Turnstile component, use the fallback
  if (hasError) {
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

  return (
    <div className={`w-full flex justify-center my-4 ${className}`}>
      <TurnstileComponent
        ref={turnstileRef}
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
