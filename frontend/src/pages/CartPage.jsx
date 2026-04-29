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
  const [paymentMethod, setPaymentMethod] = useState("MOCK_CARD");

  const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);

  const confirmBooking = async () => {
    setBooking(true);
    try {
      for (const item of items) {
        await api.post("/bookings", { eventId: item.id, couponCode, paymentMethod });
      }
      toast.success("Booking confirmed successfully");
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
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="MOCK_CARD">Mock card</option>
            <option value="MOCK_UPI">Mock UPI</option>
            <option value="MOCK_WALLET">Mock wallet</option>
          </select>
          <span>Try WELCOME10 or STUDENT20</span>
        </div>
        <h3>Total: {formatCurrency(total)}</h3>
        <button className="btn primary" onClick={() => setModalOpen(true)}>
          Pay & Confirm
        </button>
      </div>

      <Modal
        open={modalOpen}
        title="Confirm Booking"
        onClose={() => setModalOpen(false)}
        onConfirm={confirmBooking}
        confirmText={booking ? "Booking..." : "Book Now"}
      >
        <p>You are booking {items.length} events.</p>
        <p>Total payable amount: {formatCurrency(total)}</p>
        <p>Payment mode: {paymentMethod}. This app uses mock payment confirmation.</p>
      </Modal>
    </section>
  );
}

export default CartPage;
