import { Component } from "react";
import { Link } from "react-router-dom";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="empty empty-card">
          <h2>EventHub could not load this view.</h2>
          <p>Please refresh the page or go back to the events list.</p>
          <Link className="btn primary" to="/events">
            View Events
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
