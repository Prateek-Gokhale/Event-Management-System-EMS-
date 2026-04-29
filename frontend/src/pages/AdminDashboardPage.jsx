import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axiosClient";
import Loader from "../components/Loader";
import { formatDate } from "../utils/format";

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [usersRes, bookingsRes, eventsRes, analyticsRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/bookings"),
        api.get("/events"),
        api.get("/admin/analytics"),
      ]);
      setUsers(usersRes.data);
      setBookings(bookingsRes.data);
      setEvents(eventsRes.data);
      setAnalytics(analyticsRes.data);
    } catch {
      toast.error("Unable to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const updateStatus = async (bookingId, status) => {
    try {
      await api.put(`/admin/bookings/${bookingId}/status`, { status });
      toast.success(`Booking marked as ${status}`);
      loadDashboard();
    } catch (error) {
      toast.error(getErrorMessage(error, "Status update failed"));
    }
  };

  const checkIn = async (bookingId) => {
    try {
      await api.put(`/admin/bookings/${bookingId}/check-in`);
      toast.success("Ticket checked in");
      loadDashboard();
    } catch (error) {
      toast.error(getErrorMessage(error, "Check-in failed"));
    }
  };

  if (loading) return <Loader />;

  return (
    <section>
      <div className="section-head split">
        <h2>Admin Dashboard</h2>
        <div className="inline-actions">
          <Link className="btn primary" to="/admin/events/add">
            Add Event
          </Link>
          <Link className="btn ghost" to="/admin/events/manage">
            Manage Events
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Users</span>
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

      {analytics?.popularCategories && (
        <div className="card analytics-strip">
          <h3>Popular Categories</h3>
          <div className="inline-actions">
            {Object.entries(analytics.popularCategories).map(([name, count]) => (
              <span className="chip" key={name}>
                {name}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="panel-grid">
        <div className="card">
          <h3>Users</h3>
          {users.length === 0 ? (
            <p>No users available.</p>
          ) : (
            users.map((appUser) => (
              <div key={appUser.id} className="list-row">
                <div>
                  <strong>{appUser.name}</strong>
                  <p>{appUser.email}</p>
                </div>
                <div className="inline-actions">
                  <span className="chip">{appUser.role}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <h3>Bookings</h3>
          {bookings.length === 0 ? (
            <p>No bookings available.</p>
          ) : (
            bookings.slice(0, 8).map((booking) => (
              <div key={booking.id} className="list-row">
                <div>
                  <strong>{booking.eventName}</strong>
                  <p>
                    {booking.userName} - {formatDate(booking.bookingDate)}
                    {booking.ticketCode ? ` - ${booking.ticketCode}` : ""}
                  </p>
                  <span className={`status ${booking.status === "BOOKED" ? "ok" : booking.status === "PENDING" ? "pending" : "cancel"}`}>
                    {booking.checkedIn ? "CHECKED IN" : booking.status}
                  </span>
                </div>
                <div className="inline-actions">
                  <button
                    className="btn tiny"
                    onClick={() => updateStatus(booking.id, "BOOKED")}
                    disabled={booking.status !== "PENDING"}
                  >
                    Accept
                  </button>
                  <button
                    className="btn tiny"
                    onClick={() => checkIn(booking.id)}
                    disabled={booking.checkedIn || booking.status !== "BOOKED"}
                  >
                    {booking.checkedIn ? "Checked In" : "Check In"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminDashboardPage;
