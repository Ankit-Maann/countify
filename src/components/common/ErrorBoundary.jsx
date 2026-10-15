import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Countdown app error:", error, info);
  }

  handleReload = () => window.location.reload();

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="main-container">
        <section className="countdown-card" role="alert">
          <div className="event-icon">⚠️</div>
          <p className="eyebrow">SOMETHING WENT WRONG</p>
          <h1>We couldn't load this countdown</h1>
          <p className="event-description">
            Your saved countdowns are kept locally. Try reloading the page to recover the app.
          </p>
          <button className="create-countdown-btn" type="button" onClick={this.handleReload}>
            Try Again ↻
          </button>
        </section>
      </main>
    );
  }
}
