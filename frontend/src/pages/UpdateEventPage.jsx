import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axiosClient";
import Loader from "../components/Loader";

const initialState = {
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
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function UpdateEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/events/${id}`);
        const eventItem = res.data;
        setForm({
          name: eventItem.name || "",
          category: eventItem.category || "",
          description: eventItem.description || "",
          date: toDateTimeLocal(eventItem.date),
          price: eventItem.price ?? "",
          imageUrl: eventItem.imageUrl || "",
          capacity: eventItem.capacity || "100",
          venue: eventItem.venue || "",
          city: eventItem.city || "",
          address: eventItem.address || "",
          organizerName: eventItem.organizerName || "",
          organizerContact: eventItem.organizerContact || "",
        });
      } catch {
        toast.error("Unable to load event for editing");
        navigate("/admin/events/manage");
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/events/${id}`, {
        ...form,
        price: Number(form.price),
        capacity: Number(form.capacity),
        date: form.date ? `${form.date}:00` : "",
      });
      toast.success("Event updated successfully");
      navigate("/admin/events/manage");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update event");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="form-layout">
      <form className="card form-card wide" onSubmit={handleSubmit}>
        <div className="section-head split">
          <h2>Update Event</h2>
          <Link className="btn ghost" to="/admin/events/manage">
            Back
          </Link>
        </div>
        <label>
          Event Name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Category
          <input name="category" value={form.category} onChange={handleChange} required />
        </label>
        <label>
          Description
          <textarea name="description" value={form.description} onChange={handleChange} required rows={4} />
        </label>
        <label>
          Event Date & Time
          <input type="datetime-local" name="date" value={form.date} onChange={handleChange} required />
        </label>
        <label>
          Ticket Price (INR)
          <input type="number" min="1" name="price" value={form.price} onChange={handleChange} required />
        </label>
        <label>
          Image URL
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange} required />
        </label>
        <label>
          Upload Image
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => setForm((prev) => ({ ...prev, imageUrl: reader.result }));
              reader.readAsDataURL(file);
            }}
          />
        </label>
        <label>
          Capacity
          <input type="number" min="1" name="capacity" value={form.capacity} onChange={handleChange} required />
        </label>
        <label>
          Venue
          <input name="venue" value={form.venue} onChange={handleChange} />
        </label>
        <label>
          City
          <input name="city" value={form.city} onChange={handleChange} />
        </label>
        <label>
          Address
          <textarea name="address" value={form.address} onChange={handleChange} rows={2} />
        </label>
        <label>
          Organizer Name
          <input name="organizerName" value={form.organizerName} onChange={handleChange} />
        </label>
        <label>
          Organizer Contact
          <input name="organizerContact" value={form.organizerContact} onChange={handleChange} />
        </label>
        <button className="btn primary full" type="submit" disabled={saving}>
          {saving ? "Updating..." : "Update Event"}
        </button>
      </form>
    </div>
  );
}

export default UpdateEventPage;
