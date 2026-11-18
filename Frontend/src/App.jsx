import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import useAuthStore from "./stores/authStore";
import LoadingScreen from "./components/ui/LoadingScreen";

// Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import GroupsPage from "./pages/groups/GroupsPage";
import CreateGroupPage from "./pages/groups/CreateGroupPage";
import GroupDetailPage from "./pages/groups/GroupDetailPage";
import ContributionsPage from "./pages/contributions/ContributionsPage";
import PayoutsPage from "./pages/payouts/PayoutsPage";
import MeetingsPage from "./pages/meetings/MeetingsPage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import ProfilePage from "./pages/profile/ProfilePage";
import AppLayout from "./components/layout/AppLayout";

// Route guard
const ProtectedRoute = ({ children }) => {
  const { session, initialized } = useAuthStore();
  const location = useLocation();
  if (!initialized) return <LoadingScreen />;
  // Carry the destination through sign-in so a deep link — an invitation, say —
  // is not lost when the visitor is asked to authenticate first.
  if (!session)
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  return children;
};

const PublicRoute = ({ children }) => {
  const { session, initialized } = useAuthStore();
  if (!initialized) return <LoadingScreen />;
  if (session) return <Navigate to="/dashboard" replace />;
  return children;
};

// Signed-in pages all share the sidebar and header, so the guard and the shell
// are applied once here instead of being repeated around every route element.
const Protected = ({ children }) => (
  <ProtectedRoute>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <DashboardPage />
            </Protected>
          }
        />
        <Route
          path="/groups"
          element={
            <Protected>
              <GroupsPage />
            </Protected>
          }
        />
        <Route
          path="/groups/new"
          element={
            <Protected>
              <CreateGroupPage />
            </Protected>
          }
        />
        <Route
          path="/groups/:id"
          element={
            <Protected>
              <GroupDetailPage />
            </Protected>
          }
        />
        <Route
          path="/groups/:id/contributions"
          element={
            <Protected>
              <ContributionsPage />
            </Protected>
          }
        />
        <Route
          path="/groups/:id/payouts"
          element={
            <Protected>
              <PayoutsPage />
            </Protected>
          }
        />
        <Route
          path="/groups/:id/meetings"
          element={
            <Protected>
              <MeetingsPage />
            </Protected>
          }
        />
        <Route
          path="/groups/:id/analytics"
          element={
            <Protected>
              <AnalyticsPage />
            </Protected>
          }
        />
        <Route
          path="/notifications"
          element={
            <Protected>
              <NotificationsPage />
            </Protected>
          }
        />
        <Route
          path="/profile"
          element={
            <Protected>
              <ProfilePage />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
