import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axiosClient";
import Loader from "../components/Loader";
import { formatCurrency, formatDate } from "../utils/format";

function UserDashboardPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await api.get("/bookings/my");
        setBookings(res.data);
      } catch {
        toast.error("Unable to fetch your bookings");
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) return <Loader />;

  return (
    <section>
      <div className="section-head">
        <h2>My Bookings</h2>
      </div>
      {bookings.length === 0 ? (
        <div className="empty">No bookings yet. Book an event to see it here.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Event Date</th>
                <th>Price</th>
                <th>Booked On</th>
                <th>Status</th>
                <th>Ticket</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.eventName}</td>
                  <td>{formatDate(booking.eventDate)}</td>
                  <td>{formatCurrency(booking.finalPrice || booking.eventPrice)}</td>
                  <td>{formatDate(booking.bookingDate)}</td>
                  <td>
                    <span className={`status ${booking.status === "BOOKED" ? "ok" : booking.status === "PENDING" ? "pending" : "cancel"}`}>
                      {booking.checkedIn ? "CHECKED IN" : booking.status}
                    </span>
                  </td>
                  <td>
                    <strong>{booking.ticketCode}</strong>
                    <p className="qr-box">{booking.qrPayload}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default UserDashboardPage;
