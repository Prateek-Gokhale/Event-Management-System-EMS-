import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axiosClient";

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

function AddEventPage() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/events", {
        ...form,
        price: Number(form.price),
        capacity: Number(form.capacity),
        date: form.date ? `${form.date}:00` : "",
      });
      toast.success("Event added successfully");
      setForm(initialState);
      navigate("/admin/events/manage");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not add event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-layout">
      <form className="card form-card wide" onSubmit={handleSubmit}>
        <h2>Add New Event</h2>
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
        <button className="btn primary full" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Event"}
        </button>
      </form>
    </div>
  );
}

export default AddEventPage;
