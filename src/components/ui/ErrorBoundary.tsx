import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface State {
  hasError: boolean;
  error: Error | null;
}

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Something went wrong</h2>
            <p className="text-sm text-slate-500 max-w-sm">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
