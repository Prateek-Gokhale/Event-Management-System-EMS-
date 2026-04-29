import { Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import AddEventPage from "./pages/AddEventPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import CartPage from "./pages/CartPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import EventsPage from "./pages/EventsPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ManageEventsPage from "./pages/ManageEventsPage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/add"
            element={
              <ProtectedRoute requireAdmin>
                <AddEventPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/manage"
            element={
              <ProtectedRoute requireAdmin>
                <ManageEventsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
