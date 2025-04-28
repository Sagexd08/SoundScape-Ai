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
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleVerify = () => {
    // Generate a mock token
    const mockToken = `mock_${siteKey}_${Date.now()}`;
    setIsVerified(true);
    onVerify(mockToken);
  };

  if (!isLoaded) {
    return (
      <div className={`w-full flex justify-center my-4 ${className}`}>
        <div className="bg-gray-800 rounded p-4 text-center">
          <p className="text-sm text-gray-400">Loading CAPTCHA verification...</p>
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
              Please verify that you are not a robot
            </p>
            <button
              onClick={handleVerify}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm"
            >
              I'm not a robot
            </button>
          </>
        )}
      </div>
    </div>
  );
}
