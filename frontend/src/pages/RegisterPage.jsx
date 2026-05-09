import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
};

function RegisterPage() {
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
      const res = await api.post("/auth/register", form);
      login(res.data);
      toast.success("Registration successful");
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-layout">
      <form className="card form-card" onSubmit={handleSubmit} autoComplete="off">
        <h2>Create Account</h2>
        <p>Join EventHub and reserve your seats in seconds.</p>
        <label>
          Full Name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your name"
            autoComplete="off"
            required
          />
        </label>
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
            placeholder="Minimum 6 characters"
            minLength={6}
            autoComplete="new-password"
            required
          />
        </label>
        <button className="btn primary full" disabled={loading} type="submit">
          {loading ? "Creating account..." : "Register"}
        </button>
        <p className="small-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
