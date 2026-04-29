import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axiosClient";
import Modal from "../components/Modal";
import Loader from "../components/Loader";
import { formatCurrency, formatDate } from "../utils/format";

const initialForm = {
  id: null,
  name: "",
  category: "",
  description: "",
  date: "",
  price: "",
  imageUrl: "",
  capacity: "100",
  venue: "",
  city: "",
  address: "",
  organizerName: "",
  organizerContact: "",
};

function toDateTimeLocal(value) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function ManageEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(initialForm);
  const [open, setOpen] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/events");
      setEvents(res.data);
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

  const openEditor = (eventItem) => {
    setEditing({
      id: eventItem.id,
      name: eventItem.name,
      category: eventItem.category,
      description: eventItem.description,
      date: toDateTimeLocal(eventItem.date),
      price: eventItem.price,
      imageUrl: eventItem.imageUrl,
      capacity: eventItem.capacity || 100,
      venue: eventItem.venue || "",
      city: eventItem.city || "",
      address: eventItem.address || "",
      organizerName: eventItem.organizerName || "",
      organizerContact: eventItem.organizerContact || "",
    });
    setOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/events/${editing.id}`, {
        name: editing.name,
        category: editing.category,
        description: editing.description,
        date: `${editing.date}:00`,
        price: Number(editing.price),
        imageUrl: editing.imageUrl,
        capacity: Number(editing.capacity),
        venue: editing.venue,
        city: editing.city,
        address: editing.address,
        organizerName: editing.organizerName,
        organizerContact: editing.organizerContact,
      });
      toast.success("Event updated");
      setOpen(false);
      setEditing(initialForm);
      loadEvents();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed");
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
              <img src={eventItem.imageUrl} alt={eventItem.name} className="event-image" />
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
                  <button className="btn ghost" onClick={() => openEditor(eventItem)}>
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

      <Modal
        open={open}
        title="Update Event"
        onClose={() => setOpen(false)}
        onConfirm={handleUpdate}
        confirmText="Save Changes"
      >
        <div className="modal-form">
          <input
            placeholder="Event Name"
            value={editing.name}
            onChange={(e) => setEditing((prev) => ({ ...prev, name: e.target.value }))}
          />
          <input
            placeholder="Category"
            value={editing.category}
            onChange={(e) => setEditing((prev) => ({ ...prev, category: e.target.value }))}
          />
          <textarea
            rows={3}
            placeholder="Description"
            value={editing.description}
            onChange={(e) => setEditing((prev) => ({ ...prev, description: e.target.value }))}
          />
          <input
            type="datetime-local"
            value={editing.date}
            onChange={(e) => setEditing((prev) => ({ ...prev, date: e.target.value }))}
          />
          <input
            type="number"
            min="1"
            placeholder="Price"
            value={editing.price}
            onChange={(e) => setEditing((prev) => ({ ...prev, price: e.target.value }))}
          />
          <input
            placeholder="Image URL"
            value={editing.imageUrl}
            onChange={(e) => setEditing((prev) => ({ ...prev, imageUrl: e.target.value }))}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => setEditing((prev) => ({ ...prev, imageUrl: reader.result }));
              reader.readAsDataURL(file);
            }}
          />
          <input
            type="number"
            min="1"
            placeholder="Capacity"
            value={editing.capacity}
            onChange={(e) => setEditing((prev) => ({ ...prev, capacity: e.target.value }))}
          />
          <input
            placeholder="Venue"
            value={editing.venue}
            onChange={(e) => setEditing((prev) => ({ ...prev, venue: e.target.value }))}
          />
          <input
            placeholder="City"
            value={editing.city}
            onChange={(e) => setEditing((prev) => ({ ...prev, city: e.target.value }))}
          />
          <textarea
            rows={2}
            placeholder="Address"
            value={editing.address}
            onChange={(e) => setEditing((prev) => ({ ...prev, address: e.target.value }))}
          />
          <input
            placeholder="Organizer Name"
            value={editing.organizerName}
            onChange={(e) => setEditing((prev) => ({ ...prev, organizerName: e.target.value }))}
          />
          <input
            placeholder="Organizer Contact"
            value={editing.organizerContact}
            onChange={(e) => setEditing((prev) => ({ ...prev, organizerContact: e.target.value }))}
          />
        </div>
      </Modal>
    </section>
  );
}

export default ManageEventsPage;
