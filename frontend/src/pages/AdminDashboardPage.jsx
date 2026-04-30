import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "react-toastify";
import api from "../api/axiosClient";
import Loader from "../components/Loader";
import { asArray } from "../utils/apiData";

function monthKey(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString("en-IN", { month: "short", year: "2-digit" });
}

function lastFiveMonths() {
  const months = [];
  const date = new Date();
  date.setDate(1);
  for (let i = 4; i >= 0; i -= 1) {
    const item = new Date(date);
    item.setMonth(date.getMonth() - i);
    months.push(item.toLocaleString("en-IN", { month: "short", year: "2-digit" }));
  }
  return months;
}

function fillTopFive(items, labelKey, valueKey, fallbackPrefix) {
  const filled = [...items];
  for (let i = filled.length; i < 5; i += 1) {
    filled.push({ [labelKey]: `${fallbackPrefix} ${i + 1}`, [valueKey]: 0 });
  }
  return filled.slice(0, 5);
}

function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [usersRes, bookingsRes, eventsRes, analyticsRes] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/bookings"),
          api.get("/events"),
          api.get("/admin/analytics"),
        ]);
        setUsers(asArray(usersRes.data));
        setBookings(asArray(bookingsRes.data));
        setEvents(asArray(eventsRes.data));
        setAnalytics(analyticsRes.data);
      } catch {
        toast.error("Unable to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const bookingsByMonth = useMemo(() => {
    const totals = new Map();
    bookings.forEach((booking) => {
      const key = monthKey(booking.bookingDate);
      totals.set(key, (totals.get(key) || 0) + 1);
    });
    return lastFiveMonths().map((month) => ({ month, bookings: totals.get(month) || 0 }));
  }, [bookings]);

  const revenueByMonth = useMemo(() => {
    const totals = new Map();
    bookings
      .filter((booking) => booking.status === "BOOKED")
      .forEach((booking) => {
        const key = monthKey(booking.bookingDate);
        const amount = Number(booking.finalPrice || booking.eventPrice || 0);
        totals.set(key, (totals.get(key) || 0) + amount);
      });
    return lastFiveMonths().map((month) => ({ month, revenue: totals.get(month) || 0 }));
  }, [bookings]);

  const eventPopularity = useMemo(() => {
    const totals = new Map();
    bookings.forEach((booking) => {
      totals.set(booking.eventName, (totals.get(booking.eventName) || 0) + 1);
    });
    const topEvents = Array.from(totals, ([event, bookingsCount]) => ({ event, bookings: bookingsCount }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);
    if (topEvents.length >= 5) return topEvents;
    const unusedEvents = events
      .filter((eventItem) => !totals.has(eventItem.name))
      .slice(0, 5 - topEvents.length)
      .map((eventItem) => ({ event: eventItem.name, bookings: 0 }));
    return fillTopFive([...topEvents, ...unusedEvents], "event", "bookings", "Event");
  }, [bookings, events]);

  if (loading) return <Loader />;

  return (
    <section>
      <div className="section-head split">
        <h2>Admin Dashboard</h2>
        <div className="inline-actions">
          <Link className="btn ghost" to="/admin/events/manage">
            Manage Events
          </Link>
        </div>
      </div>

      <div className="operation-grid">
        <Link className="operation-card" to="/admin/events/add">
          <strong>Add Event</strong>
          <span>Create a new event for users to book.</span>
        </Link>
        <Link className="operation-card" to="/admin/events/manage">
          <strong>Update Event</strong>
          <span>Edit event date, price, venue, capacity, and organizer details.</span>
        </Link>
        <Link className="operation-card" to="/admin/events/manage">
          <strong>Delete Event</strong>
          <span>Remove events that should no longer be available.</span>
        </Link>
        <Link className="operation-card" to="/admin/bookings">
          <strong>Booked Details</strong>
          <span>Review customer bookings, tickets, payment status, and check-ins.</span>
        </Link>
        <Link className="operation-card" to="/admin/customers">
          <strong>View Customers</strong>
          <span>See registered customers and their total bookings.</span>
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Customers</span>
          <strong>{users.length}</strong>
        </div>
        <div className="stat-card">
          <span>Total Events</span>
          <strong>{events.length}</strong>
        </div>
        <div className="stat-card">
          <span>Total Bookings</span>
          <strong>{analytics?.totalBookings ?? bookings.length}</strong>
        </div>
        <div className="stat-card">
          <span>Revenue</span>
          <strong>Rs {Number(analytics?.revenue || 0).toLocaleString("en-IN")}</strong>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card chart-card">
          <div className="chart-head">
            <h3>Bookings Per Month</h3>
            <span>Last 5 months</span>
          </div>
          {bookingsByMonth.length === 0 ? (
            <div className="empty">No booking data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={bookingsByMonth} margin={{ top: 8, right: 12, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee7dc" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#e63946" radius={[8, 8, 0, 0]} barSize={34} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card chart-card">
          <div className="chart-head">
            <h3>Revenue Graph</h3>
            <span>Last 5 months</span>
          </div>
          {revenueByMonth.length === 0 ? (
            <div className="empty">No revenue data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={revenueByMonth} margin={{ top: 8, right: 18, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee7dc" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`Rs ${Number(value).toLocaleString("en-IN")}`, "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="#0f766e" strokeWidth={3} dot={{ r: 5, fill: "#0f766e" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card chart-card wide">
          <div className="chart-head">
            <h3>Events Popularity</h3>
            <span>Top 5 events</span>
          </div>
          {eventPopularity.length === 0 ? (
            <div className="empty">No event popularity data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={eventPopularity} layout="vertical" margin={{ top: 8, left: 26, right: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee7dc" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="event" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#0f766e" radius={[0, 8, 8, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminDashboardPage;
