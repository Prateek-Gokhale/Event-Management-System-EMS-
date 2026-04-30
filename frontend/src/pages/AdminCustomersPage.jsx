import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axiosClient";
import Loader from "../components/Loader";
import { asArray } from "../utils/apiData";

function AdminCustomersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const res = await api.get("/admin/users");
        setUsers(asArray(res.data));
      } catch {
        toast.error("Unable to load customers");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  if (loading) return <Loader />;

  return (
    <section>
      <div className="section-head split">
        <h2>Customer Details</h2>
        <Link className="btn ghost" to="/admin">
          Admin Dashboard
        </Link>
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
    </section>
  );
}

export default AdminCustomersPage;
