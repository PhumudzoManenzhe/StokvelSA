import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/authStore";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const forgotPassword = useAuthStore((s) => s.forgotPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">📧</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Check your email
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          We sent a password reset link to <strong>{email}</strong>
        </p>
        <Link
          to="/login"
          className="btn-primary w-full block text-center py-2.5"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Reset password</h2>
      <p className="text-gray-500 text-sm mb-6">
        Enter your email and we'll send you a reset link
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            className="input"
            placeholder="alice@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2.5"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Remember your password?{" "}
        <Link
          to="/login"
          className="text-primary-600 font-medium hover:text-primary-700"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
