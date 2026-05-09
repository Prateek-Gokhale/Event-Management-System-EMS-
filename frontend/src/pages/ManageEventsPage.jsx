import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axiosClient";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import SmartImage from "../components/SmartImage";
import { asArray } from "../utils/apiData";
import { formatCurrency, formatDate } from "../utils/format";

function ManageEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "delete" ? "delete" : "update";

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

  const onDelete = async () => {
    if (!selectedEvent) return;
    setDeleting(true);
    try {
      await api.delete(`/events/${selectedEvent.id}`);
      toast.success(`${selectedEvent.name} deleted`);
      setSelectedEvent(null);
      loadEvents();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <section>
      <div className="section-head split">
        <div>
          <h2>{mode === "delete" ? "Delete Events" : "Update Events"}</h2>
          <p className="section-note">
            {mode === "delete"
              ? "Select an event to remove it from the platform."
              : "Select an event to update its details."}
          </p>
        </div>
      </div>
      {events.length === 0 ? (
        <EmptyState
          title="No Events Found"
          message="Create an event first, then return here to update or delete it."
        />
      ) : (
        <div className="event-grid">
          {events.map((eventItem) => (
            <article key={eventItem.id} className="event-card">
              <SmartImage
                src={eventItem.imageUrl}
                alt={eventItem.name}
                className="event-image"
                width={640}
                height={360}
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
                  {mode === "update" ? (
                    <button className="btn primary full" onClick={() => navigate(`/admin/events/${eventItem.id}/edit`)}>
                      Update Event
                    </button>
                  ) : (
                    <button className="btn danger full" onClick={() => setSelectedEvent(eventItem)}>
                      Delete Event
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <Modal
        open={Boolean(selectedEvent)}
        title="Delete Event"
        onClose={() => setSelectedEvent(null)}
        onConfirm={onDelete}
        confirmText={deleting ? "Deleting..." : "Delete Event"}
        confirmDisabled={deleting}
        confirmVariant="danger"
      >
        <p>
          Delete {selectedEvent?.name}? This removes the event and related bookings, favorites,
          and reviews from the platform.
        </p>
      </Modal>
    </section>
  );
}

export default ManageEventsPage;
