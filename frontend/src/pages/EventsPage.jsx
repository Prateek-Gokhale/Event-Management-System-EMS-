import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axiosClient";
import EventCard from "../components/EventCard";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();

  const categories = useMemo(() => {
    const set = new Set(allEvents.map((eventItem) => eventItem.category).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [allEvents]);

  const eventNames = useMemo(() => {
    return ["All", ...allEvents.map((eventItem) => eventItem.name).filter(Boolean).sort()];
  }, [allEvents]);

  const cities = useMemo(() => {
    const set = new Set(allEvents.map((eventItem) => eventItem.city).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [allEvents]);

  useEffect(() => {
    const loadAllEvents = async () => {
      try {
        const res = await api.get("/events");
        setAllEvents(res.data);
      } catch {
        toast.error("Could not load filter options");
      }
    };
    loadAllEvents();
  }, []);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search && search !== "All") params.search = search;
        if (category && category !== "All") params.category = category;
        if (city && city !== "All") params.city = city;
        if (from) params.from = from;
        if (to) params.to = to;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        const res = await api.get("/events", { params });
        setEvents(res.data);
      } catch {
        toast.error("Could not fetch events");
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, [search, category, city, from, to, minPrice, maxPrice]);

  useEffect(() => {
    if (!isAuthenticated || isAdmin) return;
    api.get("/favorites").then((res) => setFavorites(res.data)).catch(() => {});
  }, [isAuthenticated, isAdmin]);

  const handleAdd = (eventItem) => {
    if (!isAuthenticated) {
      toast.info("Please login to add to cart");
      return;
    }
    const added = addToCart(eventItem);
    if (added) toast.success("Added to cart");
    else toast.info("Already in cart");
  };

  const toggleFavorite = async (eventItem) => {
    if (!isAuthenticated) {
      toast.info("Please login to save events");
      return;
    }
    try {
      const res = favorites.includes(eventItem.id)
        ? await api.delete(`/favorites/${eventItem.id}`)
        : await api.post(`/favorites/${eventItem.id}`);
      setFavorites(res.data);
    } catch {
      toast.error("Could not update wishlist");
    }
  };

  return (
    <section>
      <div className="section-head">
        <h2>All Events</h2>
      </div>

      <div className="filters">
        <select value={search} onChange={(e) => setSearch(e.target.value)}>
          {eventNames.map((name) => (
            <option key={name} value={name === "All" ? "" : name}>
              {name === "All" ? "All Events" : name}
            </option>
          ))}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat} value={cat === "All" ? "" : cat}>
              {cat}
            </option>
          ))}
        </select>
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          {cities.map((cityName) => (
            <option key={cityName} value={cityName === "All" ? "" : cityName}>
              {cityName === "All" ? "All Cities" : cityName}
            </option>
          ))}
        </select>
        <label className="filter-field">
          From Date
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="filter-field">
          To Date
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <input type="number" min="0" placeholder="Min price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        <input type="number" min="0" placeholder="Max price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
      </div>

      {loading ? (
        <Loader />
      ) : events.length === 0 ? (
        <div className="empty">No events found for this filter.</div>
      ) : (
        <div className="event-grid">
          {events.map((eventItem) => (
            <EventCard
              key={eventItem.id}
              event={eventItem}
              onAddToCart={isAdmin ? null : handleAdd}
              onToggleFavorite={isAdmin ? null : toggleFavorite}
              isFavorite={favorites.includes(eventItem.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default EventsPage;
