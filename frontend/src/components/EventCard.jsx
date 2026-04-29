import { Link } from "react-router-dom";
import { formatCurrency, formatDate } from "../utils/format";

function EventCard({ event, onAddToCart, onToggleFavorite, isFavorite = false, showActions = true }) {
  return (
    <article className="event-card">
      <img src={event.imageUrl} alt={event.name} className="event-image" />
      <div className="event-content">
        <div className="chip">{event.category}</div>
        <h3>{event.name}</h3>
        <p>{event.description}</p>
        <div className="event-meta">
          <span>{formatDate(event.date)}</span>
          <strong>{formatCurrency(event.price)}</strong>
        </div>
        <p>
          {event.availableSeats ?? 0}/{event.capacity ?? 0} seats
          {event.city ? ` - ${event.city}` : ""}
          {event.reviewCount ? ` - ${event.averageRating}/5` : ""}
        </p>

        {showActions && (
          <div className="card-actions">
            <Link className="btn ghost" to={`/events/${event.id}`}>
              View Details
            </Link>
            {onToggleFavorite && (
              <button className="btn ghost" onClick={() => onToggleFavorite(event)}>
                {isFavorite ? "Saved" : "Save"}
              </button>
            )}
            {onAddToCart && (
              <button className="btn primary" onClick={() => onAddToCart(event)} disabled={event.availableSeats === 0}>
                Add to Cart
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default EventCard;
