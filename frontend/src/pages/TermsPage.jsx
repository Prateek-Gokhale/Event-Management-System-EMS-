function TermsPage() {
  return (
    <section className="legal-page">
      <div className="legal-hero">
        <span>EventHub Terms</span>
        <h1>Terms of Service</h1>
        <p>Last updated: May 9, 2026</p>
      </div>

      <div className="legal-content">
        <article>
          <h2>Using EventHub</h2>
          <p>
            EventHub lets users discover events, add events to cart, submit booking requests, save
            favorites, and review events. Admin users can manage events, bookings, customers, and reports.
          </p>
        </article>
        <article>
          <h2>User responsibilities</h2>
          <p>
            Users must provide accurate registration details, keep login credentials private, and submit
            booking requests only for events they intend to attend.
          </p>
        </article>
        <article>
          <h2>Booking approval</h2>
          <p>
            Bookings are approval-based. Submitting a booking request does not guarantee confirmation
            until the administrator reviews and approves it.
          </p>
        </article>
        <article>
          <h2>Admin responsibilities</h2>
          <p>
            Admin users are responsible for accurate event details, seat availability, booking decisions,
            customer records, and keeping admin access restricted.
          </p>
        </article>
        <article>
          <h2>Project scope</h2>
          <p>
            This EventHub deployment is an event management system project. Legal, payment, tax, and
            cancellation policies should be finalized by the organization using it in production.
          </p>
        </article>
      </div>
    </section>
  );
}

export default TermsPage;
