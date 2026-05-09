function CompanyPage() {
  return (
    <section className="legal-page">
      <div className="legal-hero">
        <span>About EventHub</span>
        <h1>Company Details</h1>
        <p>Event management platform for attendees and organizers.</p>
      </div>

      <div className="company-grid">
        <article className="card">
          <span>Platform</span>
          <h2>EventHub EMS</h2>
          <p>
            A full-stack event management system built to discover events, manage bookings, handle
            customer records, and support admin operations from one dashboard.
          </p>
        </article>
        <article className="card">
          <span>Built by</span>
          <h2>Prateek</h2>
          <p>
            Designed and developed as a professional project with user login, admin login, event
            management, booking approval, analytics, wishlist, reviews, and AI helpdesk support.
          </p>
        </article>
        <article className="card">
          <span>Core modules</span>
          <h2>Users, Events, Bookings</h2>
          <p>
            The system includes event browsing, cart booking requests, admin event operations,
            customer management, approval workflow, responsive UI, and secure route separation.
          </p>
        </article>
      </div>

      <div className="legal-content compact">
        <article>
          <h2>Registered details</h2>
          <p>
            EventHub, Inc. is used as the project brand name for this application. Replace this section
            with official organization address, GST/tax details, support email, and legal entity details
            before public production deployment.
          </p>
        </article>
      </div>
    </section>
  );
}

export default CompanyPage;
