function PrivacyPage() {
  return (
    <section className="legal-page">
      <div className="legal-hero">
        <span>EventHub Privacy</span>
        <h1>Privacy Policy</h1>
        <p>Last updated: May 9, 2026</p>
      </div>

      <div className="legal-content">
        <article>
          <h2>Information we collect</h2>
          <p>
            EventHub collects account details such as name, email address, role, booking activity,
            saved events, reviews, and event management records needed to run the platform.
          </p>
        </article>
        <article>
          <h2>How we use information</h2>
          <p>
            We use this information to authenticate users, display events, manage bookings, track
            approvals, support favorites and reviews, and help administrators operate the event system.
          </p>
        </article>
        <article>
          <h2>Security and access</h2>
          <p>
            User and admin access are separated. Authentication tokens are used to protect private
            pages and admin-only actions. Admin tools should only be used by authorized website owners.
          </p>
        </article>
        <article>
          <h2>Data retention</h2>
          <p>
            Booking and event records are retained for operational reporting unless removed by an
            administrator or deleted from the database by the project owner.
          </p>
        </article>
        <article>
          <h2>Contact</h2>
          <p>
            For privacy questions, contact the EventHub administrator responsible for this deployment.
          </p>
        </article>
      </div>
    </section>
  );
}

export default PrivacyPage;
