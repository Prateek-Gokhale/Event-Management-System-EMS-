import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosClient";
import EventCard from "../components/EventCard";
import Loader from "../components/Loader";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { formatCurrency, formatDate } from "../utils/format";

function LandingPage() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events");
        setFeaturedEvents(res.data.slice(0, 3));
      } catch {
        toast.error("Unable to load featured events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleAddToCart = (eventItem) => {
    if (!isAuthenticated) {
      toast.info("Login to add events to cart");
      return;
    }
    const added = addToCart(eventItem);
    if (added) toast.success("Event added to cart");
    else toast.info("Event already in cart");
  };

  return (
    <section>
      <div className="hero">
        <div className="hero-text">
          <p className="tag">Next-gen Event Booking Platform</p>
          <h1>Discover, Book, and Manage Events In One Beautiful Workspace</h1>
          <p>
            Explore concerts, workshops, festivals, and conferences with a smooth booking
            experience built for both attendees and organizers.
          </p>
          <div className="hero-actions">
            <Link className="btn primary" to="/events">
              Explore Events
            </Link>
            <Link className="btn ghost" to={isAuthenticated ? "/dashboard" : "/register"}>
              {isAuthenticated ? "My Bookings" : "Create Account"}
            </Link>
          </div>
        </div>
        <div className="hero-highlights">
          <h3>Upcoming Highlights</h3>
          <div className="highlight-list">
            {featuredEvents.slice(0, 3).map((eventItem) => (
              <Link className="highlight-row" to={`/events/${eventItem.id}`} key={eventItem.id}>
                <div>
                  <strong>{eventItem.name}</strong>
                  <span>{eventItem.city || "Venue TBA"} - {formatDate(eventItem.date)}</span>
                </div>
                <b>{formatCurrency(eventItem.price)}</b>
              </Link>
            ))}
            {featuredEvents.length === 0 && <p>No events available yet.</p>}
          </div>
        </div>
      </div>

      <section className="home-events">
        <div className="section-head">
          <h2>Featured Events</h2>
          <Link to="/events">View all</Link>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="event-grid centered-events">
            {featuredEvents.map((eventItem) => (
              <EventCard
                key={eventItem.id}
                event={eventItem}
                onAddToCart={isAdmin ? null : handleAddToCart}
                showActions
              />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

export default LandingPage;
