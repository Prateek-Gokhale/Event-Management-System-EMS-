import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axiosClient";
import Loader from "../components/Loader";
import { asArray } from "../utils/apiData";
import { formatCurrency, formatDate } from "../utils/format";
import { optimizedImageUrl } from "../utils/images";

function ManageEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/events");
      setEvents(asArray(res.data));
    } catch {
      toast.error("Unable to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const onDelete = async (id) => {
    try {
      await api.delete(`/events/${id}`);
      toast.success("Event deleted");
      loadEvents();
    } catch {
      toast.error("Delete failed");
    }
  };

  if (loading) return <Loader />;

  return (
    <section>
      <div className="section-head">
        <h2>Manage Events</h2>
      </div>
      {events.length === 0 ? (
        <div className="empty">No events found.</div>
      ) : (
        <div className="event-grid">
          {events.map((eventItem) => (
            <article key={eventItem.id} className="event-card">
              <img
                src={optimizedImageUrl(eventItem.imageUrl)}
                alt={eventItem.name}
                className="event-image"
                loading="lazy"
                decoding="async"
              />
              <div className="event-content">
                <div className="chip">{eventItem.category}</div>
                <h3>{eventItem.name}</h3>
                <p>{eventItem.description}</p>
                <div className="event-meta">
                  <span>{formatDate(eventItem.date)}</span>
                  <strong>{formatCurrency(eventItem.price)}</strong>
                </div>
                <p>
                  {eventItem.availableSeats}/{eventItem.capacity} seats available
                  {eventItem.city ? ` - ${eventItem.city}` : ""}
                </p>
                <div className="card-actions">
                  <button className="btn ghost" onClick={() => navigate(`/admin/events/${eventItem.id}/edit`)}>
                    Edit
                  </button>
                  <button className="btn danger" onClick={() => onDelete(eventItem.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ManageEventsPage;
