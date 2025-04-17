// Create improved error handling utilities
import { toast } from 'sonner';

// Types of common network errors
const NETWORK_ERROR_TYPES = [
  'Failed to fetch',
  'NetworkError',
  'Network request failed',
  'The Internet connection appears to be offline',
  'Network error',
];

// Enhanced fetch with error handling and retry logic
export async function fetchWithErrorHandling<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const MAX_RETRIES = 3;
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < MAX_RETRIES) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        next: { revalidate: 0 }, // Disable cache for fetch requests
      });

      if (!response.ok) {
        // Try to parse error message from response
        let errorMessage = `HTTP error ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // Could not parse JSON error response
        }
        throw new Error(errorMessage);
      }

      return await response.json() as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if it's a network error that might benefit from retry
      const isNetworkError = NETWORK_ERROR_TYPES.some(type => 
        lastError?.message?.includes(type)
      );
      
      if (isNetworkError) {
        // Exponential backoff: 500ms, 1000ms, 2000ms, etc.
        const delay = Math.pow(2, attempt) * 500;
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
        console.log(`Retrying fetch (${attempt}/${MAX_RETRIES})...`);
      } else {
        // Not a network error, don't retry
        break;
      }
    }
  }

  // If all retries failed or not a retryable error
  if (lastError) {
    toast.error('Network error', {
      description: 'Failed to connect to the server. Please check your connection.',
    });
    throw lastError;
  }
  
  // This should never happen, but TypeScript needs it
  throw new Error('Unknown fetch error');
}

// Global error handler
export function handleGlobalErrors() {
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      
      // Don't show toast for CORS errors and other noise
      if (!event.message.includes('Script error')) {
        toast.error('Something went wrong', {
          description: 'The application encountered an error.',
        });
      }
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled rejection:', event.reason);
      
      if (event.reason?.message && !NETWORK_ERROR_TYPES.some(type => 
          event.reason.message.includes(type))) {
        toast.error('Operation failed', {
          description: event.reason.message || 'Please try again later.',
        });
      }
    });
  }
}