import React from 'react';

type State = {
  hasError: boolean;
};

export default class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('[AppErrorBoundary] Rendering error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FBF9F4] text-slate-900 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-black">Wystąpił błąd aplikacji</h1>
            <p className="text-sm text-slate-700">Odśwież stronę lub wróć do strony głównej.</p>
            <a
              href="/"
              className="inline-flex items-center rounded-xl bg-blue-600 text-white px-4 py-2 font-bold hover:bg-blue-700 transition-colors"
            >
              Wróć do strony głównej
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
