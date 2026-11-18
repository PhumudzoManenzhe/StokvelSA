import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import useAuthStore from "./stores/authStore";
import LoadingScreen from "./components/ui/LoadingScreen";

// Entry pages load with the shell, because they are the first thing a visitor
// sees and a spinner there is worse than the few kilobytes they cost.
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import LandingPage from "./pages/LandingPage";
import AppLayout from "./components/layout/AppLayout";

// Everything behind the sign-in wall is split into its own chunk. Loading all of
// it up front put every chart, table and form in one bundle; a visitor who only
// wanted the landing page paid for the analytics dashboard.
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const GroupsPage = lazy(() => import("./pages/groups/GroupsPage"));
const CreateGroupPage = lazy(() => import("./pages/groups/CreateGroupPage"));
const GroupDetailPage = lazy(() => import("./pages/groups/GroupDetailPage"));
const JoinGroupPage = lazy(() => import("./pages/groups/JoinGroupPage"));
const ContributionsPage = lazy(() => import("./pages/contributions/ContributionsPage"));
const PayoutsPage = lazy(() => import("./pages/payouts/PayoutsPage"));
const MeetingsPage = lazy(() => import("./pages/meetings/MeetingsPage"));
const AnalyticsPage = lazy(() => import("./pages/analytics/AnalyticsPage"));
const NotificationsPage = lazy(() => import("./pages/notifications/NotificationsPage"));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));

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
// Every page that is fetched on demand sits inside this boundary, which keeps the
// navigation in place while only the content area waits.
const Protected = ({ children }) => (
  <ProtectedRoute>
    <AppLayout>
      <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
    </AppLayout>
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
        {/* Not wrapped in PublicRoute: a recovery link signs the user in, and
            PublicRoute would redirect them away before they set a password. */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />
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
          path="/join"
          element={
            <Protected>
              <JoinGroupPage />
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
