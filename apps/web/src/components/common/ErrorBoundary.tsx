import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{ padding: '2rem', maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}
        >
          <div className="card" style={{ borderLeft: '4px solid var(--status-error-border)' }}>
            <h2 style={{ color: 'var(--status-error-text)', marginBottom: '0.75rem' }}>
              Something went wrong
            </h2>
            <p
              style={{
                color: 'var(--text-secondary)',
                marginBottom: '1.25rem',
                fontSize: '0.9rem',
              }}
            >
              {this.state.error?.message || 'An unexpected error occurred in the application.'}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
