'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
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
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isScriptError, setIsScriptError] = useState(false);
  const [captchaId, setCaptchaId] = useState<string | null>(null);

  // Initialize the CAPTCHA when the component mounts
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
      return;
    }

    // Skip if script is not loaded or there's an error
    if (!isScriptLoaded || isScriptError || hasError) {
      return;
    }

    // Make sure window.turnstile is available
    if (typeof window !== 'undefined' && window.turnstile) {
      try {
        // Generate a unique ID for this CAPTCHA instance
        const id = `turnstile-${Math.random().toString(36).substring(2, 9)}`;
        setCaptchaId(id);

        // Create a container for the CAPTCHA
        const container = document.createElement('div');
        container.id = id;

        // Find the parent element and append the container
        const parent = document.getElementById('captcha-container');
        if (parent) {
          // Clear any existing content
          parent.innerHTML = '';
          parent.appendChild(container);

          // Render the CAPTCHA
          window.turnstile.render(`#${id}`, {
            sitekey: siteKey,
            callback: (token: string) => {
              console.log('CAPTCHA verified:', token);
              onVerify(token);
            },
            'expired-callback': () => {
              console.log('CAPTCHA expired');
              if (onExpire) onExpire();
            },
            'error-callback': () => {
              console.error('CAPTCHA error');
              handleError();
            },
            theme: 'dark',
          });
        } else {
          console.error('CAPTCHA container not found');
          handleError();
        }
      } catch (error) {
        console.error('Error initializing CAPTCHA:', error);
        handleError();
      }
    } else {
      console.error('Turnstile not available');
      handleError();
    }

    // Cleanup function
    return () => {
      if (captchaId && typeof window !== 'undefined' && window.turnstile) {
        try {
          window.turnstile.remove(`#${captchaId}`);
        } catch (error) {
          console.error('Error removing CAPTCHA:', error);
        }
      }
    };
  }, [isMounted, isScriptLoaded, isScriptError, hasError, siteKey, onVerify, onExpire]);

  // Handle errors with the CAPTCHA
  const handleError = () => {
    setHasError(true);
    if (onError) onError();
  };

  // Handle script load event
  const handleScriptLoad = () => {
    console.log('Turnstile script loaded');
    setIsScriptLoaded(true);
  };

  // Handle script error event
  const handleScriptError = () => {
    console.error('Failed to load Turnstile script');
    setIsScriptError(true);
    handleError();
  };

  // If there's an error loading the CAPTCHA, use the fallback
  if (hasError || isScriptError) {
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
      {/* Load the Turnstile script */}
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
        strategy="afterInteractive"
      />

      {/* Container for the CAPTCHA */}
      <div id="captcha-container" className="min-h-[65px]">
        {!isScriptLoaded && (
          <div className="bg-gray-800 rounded p-4 text-center">
            <p className="text-sm text-gray-400">Loading CAPTCHA verification...</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Add the Turnstile type to the global Window interface
declare global {
  interface Window {
    turnstile: {
      render: (selector: string, options: any) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}
