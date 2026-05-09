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

function getStatusLabel(booking) {
  return booking.checkedIn ? "CHECKED IN" : booking.status;
}

function getStatusClass(booking) {
  if (booking.checkedIn) return "ok";
  if (booking.status === "BOOKED") return "ok";
  if (booking.status === "PENDING") return "pending";
  return "cancel";
}

function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/bookings");
      setBookings(asArray(res.data));
    } catch {
      toast.error("Unable to load booked details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const updateStatus = async (bookingId, status) => {
    try {
      await api.put(`/admin/bookings/${bookingId}/status`, { status });
      toast.success(`Booking marked as ${status}`);
      loadBookings();
    } catch (error) {
      toast.error(getErrorMessage(error, "Status update failed"));
    }
  };

  const checkIn = async (bookingId) => {
    try {
      await api.put(`/admin/bookings/${bookingId}/check-in`);
      toast.success("Ticket checked in");
      loadBookings();
    } catch (error) {
      toast.error(getErrorMessage(error, "Check-in failed"));
    }
  };

  if (loading) return <Loader />;

  return (
    <section>
      <div className="section-head split">
        <h2>Booked Details</h2>
        <Link className="btn ghost" to="/admin">
          Admin Dashboard
        </Link>
      </div>

      <div className="table-wrap" id="booked-details">
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
              {bookings.map((booking, index) => (
                <tr key={booking.id}>
                  <td>{index + 1}</td>
                  <td>{booking.userName}</td>
                  <td>{booking.eventName}</td>
                  <td>{formatDate(booking.eventDate)}</td>
                  <td>{formatDate(booking.bookingDate)}</td>
                  <td>{formatCurrency(booking.finalPrice || booking.eventPrice)}</td>
                  <td>{booking.paymentStatus || "N/A"}</td>
                  <td>{booking.ticketCode || "N/A"}</td>
                  <td>
                    <span className={`status ${getStatusClass(booking)}`}>
                      {getStatusLabel(booking)}
                    </span>
                  </td>
                  <td>
                    <div className="inline-actions">
                      {booking.status === "PENDING" && (
                        <>
                          <button className="btn tiny success" onClick={() => updateStatus(booking.id, "BOOKED")}>
                            Accept
                          </button>
                          <button className="btn tiny danger" onClick={() => updateStatus(booking.id, "CANCELLED")}>
                            Cancel
                          </button>
                        </>
                      )}
                      {booking.status === "BOOKED" && !booking.checkedIn && (
                        <button className="btn tiny" onClick={() => checkIn(booking.id)}>
                          Check In
                        </button>
                      )}
                      {(booking.status === "CANCELLED" || booking.checkedIn) && <span className="muted-action">Done</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export default AdminBookingsPage;
