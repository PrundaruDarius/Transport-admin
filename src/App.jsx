import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import LinesPage from "./pages/LinesPage.jsx";
import StationsPage from "./pages/StationsPage.jsx";
import TimetablePage from "./pages/TimetablePage.jsx";
import AnnouncementsPage from "./pages/AnnouncementsPage.jsx";
import PricesPage from "./pages/PricesPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";


export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="lines" element={<LinesPage />} />
        <Route path="stations" element={<StationsPage />} />
        <Route path="timetable" element={<TimetablePage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="prices" element={<PricesPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
