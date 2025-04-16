import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-gray-400 mb-6">We're sorry for the inconvenience</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Reload Page
          </Button>
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