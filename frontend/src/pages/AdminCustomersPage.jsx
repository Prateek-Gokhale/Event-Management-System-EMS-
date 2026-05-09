import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axiosClient";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import { asArray } from "../utils/apiData";

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

function AdminCustomersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(asArray(res.data).filter((appUser) => appUser.role !== "ADMIN"));
    } catch {
      toast.error("Unable to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const deleteUser = async () => {
    if (!selectedUser) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${selectedUser.id}`);
      toast.success(`${selectedUser.name} removed`);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to remove customer"));
    } finally {
      setDeleting(false);
    }
  };

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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((appUser, index) => (
                <tr key={appUser.id}>
                  <td>{index + 1}</td>
                  <td>{appUser.name}</td>
                  <td>{appUser.email}</td>
                  <td>
                    <span className="chip">{appUser.role}</span>
                  </td>
                  <td>{appUser.totalBookings ?? 0}</td>
                  <td>
                    <button
                      className="btn tiny danger"
                      type="button"
                      onClick={() => setSelectedUser(appUser)}
                      disabled={appUser.role === "ADMIN"}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={Boolean(selectedUser)}
        title="Remove Customer"
        onClose={() => setSelectedUser(null)}
        onConfirm={deleteUser}
        confirmText={deleting ? "Removing..." : "Remove"}
      >
        <p>
          Remove {selectedUser?.name}? This will delete the customer account and all related bookings,
          favorites, and reviews.
        </p>
      </Modal>
    </section>
  );
}

export default AdminCustomersPage;
