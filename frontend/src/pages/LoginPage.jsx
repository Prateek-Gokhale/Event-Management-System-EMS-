import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login(res.data);
      toast.success("Login successful");
      if (res.data.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/events");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-layout">
      <form className="card form-card" onSubmit={handleSubmit}>
        <h2>Welcome Back</h2>
        <p>Login to book events and manage your dashboard.</p>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
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
            required
          />
        </label>
        <button className="btn primary full" disabled={loading} type="submit">
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="small-text">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
        <div className="demo-hint">
          <span>Demo User: user@ems.com / User@123</span>
          <span>Demo Admin: admin@ems.com / Admin@123</span>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
