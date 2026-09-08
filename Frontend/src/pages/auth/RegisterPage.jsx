import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/authStore";

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirm: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(
        err.response?.data?.error || err.message || "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Create account</h2>
      <p className="text-gray-500 text-sm mb-6">
        Start managing your stokvel today
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            className="input"
            placeholder="Alice Dlamini"
            value={form.fullName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="label" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input"
            placeholder="alice@example.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="label" htmlFor="phone">
            Phone number <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="input"
            placeholder="+27821234567"
            value={form.phone}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="input"
            placeholder="Min 8 characters"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="label" htmlFor="confirm">
            Confirm password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            className="input"
            placeholder="Repeat password"
            value={form.confirm}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2.5"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
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
