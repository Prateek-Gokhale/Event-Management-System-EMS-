import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="card empty-card">
      <h2>404 · Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link className="btn primary" to="/">
        Back to Home
      </Link>
    </section>
  );
}

export default NotFoundPage;
