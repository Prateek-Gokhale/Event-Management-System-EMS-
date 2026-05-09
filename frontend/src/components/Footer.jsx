import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-legal">
          <span>&copy; 2026 EventHub, Inc.</span>
          <span aria-hidden="true">&middot;</span>
          <Link to="/privacy">Privacy</Link>
          <span aria-hidden="true">&middot;</span>
          <Link to="/terms">Terms</Link>
          <span aria-hidden="true">&middot;</span>
          <Link to="/company">Company details</Link>
        </div>

        <strong className="footer-credit">Built by Prateek</strong>

        <div className="footer-meta">
          <div className="footer-socials" aria-label="Social media links">
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 8h2V5h-2c-2.2 0-4 1.8-4 4v2H8v3h2v5h3v-5h2.3l.7-3h-3V9c0-.6.4-1 1-1Z" />
              </svg>
            </a>
            <a href="https://x.com/" target="_blank" rel="noreferrer" aria-label="X">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4" y="4" width="16" height="16" rx="5" />
                <circle cx="12" cy="12" r="3.5" />
                <circle cx="17" cy="7" r="1" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
