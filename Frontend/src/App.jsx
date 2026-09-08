import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./stores/authStore";
import LoadingScreen from "./components/ui/LoadingScreen";

// Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";

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
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
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
            <ProtectedRoute>
              <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="card max-w-md w-full text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Dashboard coming soon
                  </h1>
                  <p className="text-sm text-gray-500 mb-6">
                    The auth pages are working, and the dashboard shell can be
                    added next.
                  </p>
                  <button
                    type="button"
                    onClick={() => useAuthStore.getState().logout()}
                    className="btn-secondary w-full py-2.5"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
