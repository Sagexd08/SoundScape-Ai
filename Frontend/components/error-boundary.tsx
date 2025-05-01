import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RefreshCcw, AlertCircle } from 'lucide-react';

// Declare global gtag function for Google Analytics
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: object) => void;
  }
}

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorMessage?: string;
  isReactHookError?: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is a React hooks error
    const isReactHookError = error.message.includes('Rendered more hooks than during the previous render');

    return {
      hasError: true,
      error,
      errorMessage: error.message,
      isReactHookError
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // Log to analytics or monitoring service if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'error', {
        error_message: error.message,
        error_info: JSON.stringify(errorInfo),
        error_type: this.state.isReactHookError ? 'react_hook_error' : 'general_error'
      });
    }
  }

  handleTryAgain = () => {
    // For React hook errors, we need to do a full page reload
    // as the component state might be corrupted
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
          <div className="max-w-md w-full bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/30 text-red-400">
              <AlertCircle size={28} />
            </div>

            <h2 className="text-2xl font-bold mb-2 text-center">Something went wrong</h2>

            {this.state.isReactHookError ? (
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
                onClick={this.handleTryAgain}
                className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
              >
                <RefreshCcw size={16} />
                Try Again
              </Button>
            </div>

            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.errorMessage && (
              <div className="mt-6 p-3 bg-gray-900 rounded border border-gray-700 text-xs text-gray-400 overflow-auto max-h-32">
                <pre>{this.state.errorMessage}</pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC to wrap components with error boundary and toast notifications
export function withErrorHandling<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithErrorHandling(props: P) {
    const { toast } = useToast();

    return (
      <ErrorBoundary>
        <WrappedComponent
          {...props}
          onError={(error: Error) => {
            toast({
              title: 'Error',
              description: error.message,
              variant: 'destructive',
            });
          }}
        />
      </ErrorBoundary>
    );
  };
}