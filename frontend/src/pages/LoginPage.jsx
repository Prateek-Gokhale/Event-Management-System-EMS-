import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

const EMPTY_FORM = {
  email: "",
  password: "",
};

function LoginPage({ admin = false }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(EMPTY_FORM);
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      const isAdminAccount = res.data.role === "ADMIN";
      if (admin && !isAdminAccount) {
        toast.error("Use the user login for attendee accounts");
        return;
      }
      if (!admin && isAdminAccount) {
        toast.error("Admins must use the admin login portal");
        navigate("/admin/login");
        return;
      }
      login(res.data);
      toast.success("Login successful");
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-layout">
      <form className="card form-card" onSubmit={handleSubmit} autoComplete="off">
        <h2>{admin ? "Admin Login" : "User Login"}</h2>
        <p>
          {admin
            ? "Sign in to manage events, bookings, customers, and analytics."
            : "Sign in to book events, save favorites, and view your tickets."}
        </p>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="off"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter password"
            autoComplete="new-password"
            required
          />
        </label>
        <button className="btn primary full" disabled={loading} type="submit">
          {loading ? "Logging in..." : admin ? "Login as Admin" : "Login as User"}
        </button>
        {admin ? (
          <p className="small-text">
            Attendee account? <Link to="/login">User Login</Link>
          </p>
        ) : (
          <>
            <p className="small-text">
              Don&apos;t have an account? <Link to="/register">Register</Link>
            </p>
            <p className="small-text">
              Website administrator? <Link to="/admin/login">Admin Login</Link>
            </p>
          </>
        )}
        <div className="demo-hint">
          {admin ? (
            <span>Demo Admin: admin@ems.com / Admin@123</span>
          ) : (
            <span>Demo User: user@ems.com / User@123</span>
          )}
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
