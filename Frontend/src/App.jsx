import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./stores/authStore";
import LoadingScreen from "./components/ui/LoadingScreen";

// Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import AppLayout from "./components/layout/AppLayout";

// Route guard
const ProtectedRoute = ({ children }) => {
  const { session, initialized } = useAuthStore();
  if (!initialized) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { session, initialized } = useAuthStore();
  if (!initialized) return <LoadingScreen />;
  if (session) return <Navigate to="/dashboard" replace />;
  return children;
};

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
            <ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
