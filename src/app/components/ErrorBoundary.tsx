import { Component, type ReactNode } from 'react';
interface Props {
  children: ReactNode;
  resetKey?: string;
}
/** Render and lazy-import failures stay within the route; navigation remains available. */
export default class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    // Keep diagnostics useful without copying URLs, tokens, or response bodies.
    console.error('[ui] render_failed', { type: error.name });
  }
  componentDidUpdate(previous: Props) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey)
      this.setState({ failed: false });
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section className="vw-page page-shell vw-empty" role="alert">
        <h1>This page couldn’t load.</h1>
        <p>Check your connection and try again. Your saved wallpapers have not been removed.</p>
        <button className="outline-button" type="button" onClick={() => window.location.reload()}>
          Reload page
        </button>
        <a className="text-link" href="/">
          Back to the collection
        </a>
      </section>
    );
  }
}
