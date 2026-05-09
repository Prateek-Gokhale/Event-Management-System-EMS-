import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./routes/ProtectedRoute";

const AddEventPage = lazy(() => import("./pages/AddEventPage"));
const AdminBookingsPage = lazy(() => import("./pages/AdminBookingsPage"));
const AdminCustomersPage = lazy(() => import("./pages/AdminCustomersPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const EventDetailsPage = lazy(() => import("./pages/EventDetailsPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const ManageEventsPage = lazy(() => import("./pages/ManageEventsPage"));
const UpdateEventPage = lazy(() => import("./pages/UpdateEventPage"));
const UserDashboardPage = lazy(() => import("./pages/UserDashboardPage"));

function App() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        <ErrorBoundary resetKey={location.pathname}>
          <Suspense fallback={<Loader />}>
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
              <Route
                path="/admin/events/:id/edit"
                element={
                  <ProtectedRoute requireAdmin>
                    <UpdateEventPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bookings"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminBookingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/customers"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminCustomersPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

export default App;
