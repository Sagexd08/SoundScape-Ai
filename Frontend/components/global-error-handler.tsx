'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, AlertCircle } from 'lucide-react';

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
}

export function GlobalErrorHandler({ children }: GlobalErrorHandlerProps) {
  const [hasError, setHasError] = useState(false);
  const [isReactHookError, setIsReactHookError] = useState(false);

  useEffect(() => {
    // Listen for unhandled errors
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      
      // Check if this is a React hooks error
      if (event.error && event.error.message && 
          event.error.message.includes('Rendered more hooks than during the previous render')) {
        setIsReactHookError(true);
        setHasError(true);
        
        // Prevent the error from propagating
        event.preventDefault();
      }
    };

    // Add event listener
    window.addEventListener('error', handleError);

    // Clean up
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Handle try again button click
  const handleTryAgain = () => {
    window.location.reload();
  };

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
        <div className="max-w-md w-full bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/30 text-red-400">
            <AlertCircle size={28} />
          </div>
          
          <h2 className="text-2xl font-bold mb-2 text-center">Something went wrong</h2>
          
          {isReactHookError ? (
            <div className="mb-6">
              <p className="text-gray-300 mb-2 text-center">
                We encountered a React rendering error (Error #310)
              </p>
              <p className="text-gray-400 text-sm text-center">
                This is a known issue with our animated components. Clicking the button below should fix it.
              </p>
            </div>
          ) : (
            <p className="text-gray-400 mb-6 text-center">
              We're sorry for the inconvenience. Please try again.
            </p>
          )}
          
          <div className="flex justify-center">
            <Button
              onClick={handleTryAgain}
              className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
            >
              <RefreshCcw size={16} />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
