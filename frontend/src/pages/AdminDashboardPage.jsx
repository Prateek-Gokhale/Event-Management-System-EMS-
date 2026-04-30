import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axiosClient";
import Loader from "../components/Loader";
import { asArray } from "../utils/apiData";
import { formatCurrency, formatDate } from "../utils/format";

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
        <a className="operation-card" href="#booked-details">
          <strong>Booked Details</strong>
          <span>Review all customer bookings, tickets, payment status, and check-ins.</span>
        </a>
        <a className="operation-card" href="#customer-details">
          <strong>View Customers</strong>
          <span>See registered customers and their total bookings.</span>
        </a>
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

      <div className="dashboard-section" id="customer-details">
        <div className="section-head">
          <h2>Customer Details</h2>
        </div>
        <div className="table-wrap">
          {users.length === 0 ? (
            <div className="empty">No customers available.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Total Bookings</th>
                </tr>
              </thead>
              <tbody>
                {users.map((appUser) => (
                  <tr key={appUser.id}>
                    <td>{appUser.id}</td>
                    <td>{appUser.name}</td>
                    <td>{appUser.email}</td>
                    <td>
                      <span className="chip">{appUser.role}</span>
                    </td>
                    <td>{appUser.totalBookings ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="dashboard-section" id="booked-details">
        <div className="section-head">
          <h2>Booked Details</h2>
        </div>
        <div className="table-wrap">
          {bookings.length === 0 ? (
            <div className="empty">No bookings available.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Event</th>
                  <th>Event Date</th>
                  <th>Booked On</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Ticket</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>{booking.userName}</td>
                    <td>{booking.eventName}</td>
                    <td>{formatDate(booking.eventDate)}</td>
                    <td>{formatDate(booking.bookingDate)}</td>
                    <td>{formatCurrency(booking.finalPrice || booking.eventPrice)}</td>
                    <td>{booking.paymentStatus || "N/A"}</td>
                    <td>{booking.ticketCode || "N/A"}</td>
                    <td>
                      <span className={`status ${booking.status === "BOOKED" ? "ok" : booking.status === "PENDING" ? "pending" : "cancel"}`}>
                        {booking.checkedIn ? "CHECKED IN" : booking.status}
                      </span>
                    </td>
                    <td>
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminDashboardPage;
