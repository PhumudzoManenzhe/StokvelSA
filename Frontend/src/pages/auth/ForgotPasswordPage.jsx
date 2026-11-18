import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import AuthLayout from "../../components/layout/AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const forgotPassword = useAuthStore((s) => s.forgotPassword);

  const handleSubmit = async (event) => {
    event.preventDefault();
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

  return (
    <AuthLayout
      image="/images/auth-register.jpg"
      imageAlt="A group of South African friends laughing together around a laptop at home"
      greeting="Sawubona"
      title="We will get you back in."
    >
      {sent ? (
        <div>
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Mail size={22} />
          </span>
          <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight text-stone-900">
            Check your inbox
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            We sent a reset link to <strong>{email}</strong>. It expires after a
            short while, so use it soon.
          </p>
          <p className="mt-3 text-sm leading-6 text-stone-500">
            Nothing arrived? Look in your spam folder, then{" "}
            <button
              type="button"
              onClick={() => setSent(false)}
              className="font-semibold text-primary-700 underline-offset-2 hover:underline"
            >
              try a different address
            </button>
            .
          </p>

          <Link
            to="/login"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <div>
          <p className="text-sm font-semibold text-primary-700">
            Password help
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-stone-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Enter the email you signed up with and we will send you a link to
            choose a new password.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="label text-stone-700" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="input border-stone-300 py-3"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
            >
              {loading ? (
                "Sending the link..."
              ) : (
                <>
                  Send reset link <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-stone-600">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 font-semibold text-primary-700 hover:text-primary-800"
            >
              <ArrowLeft size={15} />
              Back to sign in
            </Link>
          </p>
        </div>
      )}
    </AuthLayout>
  );
}
