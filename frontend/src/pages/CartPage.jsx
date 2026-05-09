import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axiosClient";
import Modal from "../components/Modal";
import { useCart } from "../context/CartContext";
import { formatCurrency, formatDate } from "../utils/format";

function CartPage() {
  const { items, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);

  const confirmBooking = async () => {
    if (booking) return;
    setBooking(true);
    try {
      await api.post("/bookings/batch", {
        items: items.map((item) => ({ eventId: item.id, couponCode })),
      });
      toast.success("Booking request submitted");
      clearCart();
      navigate("/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Booking failed for one or more events");
    } finally {
      setBooking(false);
      setModalOpen(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="card empty-card">
        <h2>Your cart is empty</h2>
        <p>Add events from the events page to book your next experience.</p>
        <Link to="/events" className="btn primary">
          Browse Events
        </Link>
      </section>
    );
  }

  return (
    <section>
      <div className="section-head">
        <h2>Your Cart</h2>
      </div>
      <div className="cart-list">
        {items.map((item) => (
          <div className="cart-item" key={item.id}>
            <div>
              <h3>{item.name}</h3>
              <p>{formatDate(item.date)}</p>
            </div>
            <div className="cart-item-right">
              <strong>{formatCurrency(item.price)}</strong>
              <button className="btn ghost" onClick={() => removeFromCart(item.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-footer">
        <div className="coupon-box">
          <input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
          <span>Try WELCOME10 or STUDENT20</span>
        </div>
        <h3>Total: {formatCurrency(total)}</h3>
        <button className="btn primary" onClick={() => setModalOpen(true)}>
          Submit Booking
        </button>
      </div>

      <Modal
        open={modalOpen}
        title="Confirm Booking"
        onClose={() => setModalOpen(false)}
        onConfirm={confirmBooking}
        confirmText={booking ? "Submitting..." : "Submit Request"}
        confirmDisabled={booking}
      >
        <p>You are booking {items.length} events.</p>
        <p>Estimated total amount: {formatCurrency(total)}</p>
        <p>Your booking will be sent to the admin for approval.</p>
      </Modal>
    </section>
  );
}

export default CartPage;
