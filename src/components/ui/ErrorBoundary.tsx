// ErrorBoundary — catches render errors anywhere in the subtree.
// On error: logs the failure and shows a fallback so the app shell stays usable.
import { Component, type ReactNode } from 'react';

interface Props {
  fallback?: ReactNode;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: unknown) {
    // Surface to console — production setups can hook this into Sentry/Datadog.
    console.error('[ErrorBoundary] Caught render error:', error, info);
  }

  reset = () => this.setState({ error: null });

  override render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          <h2 className="text-base font-semibold">Something went wrong</h2>
          <p className="mt-2">
            The dashboard hit an unexpected error. The rest of the app is still usable —
            try reloading this section.
          </p>
          <pre className="mt-3 max-h-32 overflow-auto rounded border border-red-200 bg-white p-2 font-mono text-[11px] text-red-700">
            {this.state.error.message}
          </pre>
          <button
            onClick={this.reset}
            className="mt-3 rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
