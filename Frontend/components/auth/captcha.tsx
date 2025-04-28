'use client';

import { useEffect, useRef } from 'react';
import { Turnstile } from 'react-turnstile';

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

  // Reset the CAPTCHA when the component unmounts
  useEffect(() => {
    return () => {
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
    };
  }, []);

  return (
    <div className={`w-full flex justify-center my-4 ${className}`}>
      <Turnstile
        ref={turnstileRef}
        sitekey={siteKey}
        onVerify={onVerify}
        onExpire={onExpire}
        onError={onError}
        theme="dark"
        size="normal"
      />
    </div>
  );
}
