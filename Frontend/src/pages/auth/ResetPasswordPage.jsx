import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowRight } from "lucide-react";
import { supabase } from "../../lib/supabase";
import AuthLayout from "../../components/layout/AuthLayout";

// Supabase sends the user here from the reset email. Opening the link creates a
// short-lived recovery session, which is what allows updateUser to run — so this
// page must not sit behind PublicRoute, which would bounce a session away.
export default function ResetPasswordPage() {
  const [status, setStatus] = useState("checking");
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let settled = false;
    const ready = () => {
      settled = true;
      setStatus("ready");
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) ready();
    });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session || event === "PASSWORD_RECOVERY") ready();
    });

    // The client reads the recovery token out of the URL just after mount, so
    // there may be no session on the first tick. Only call the link dead once
    // that moment has passed.
    const timer = setTimeout(() => {
      if (!settled) setStatus("invalid");
    }, 1500);

    return () => {
      clearTimeout(timer);
      data.subscription.unsubscribe();
    };
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (form.password.length < 8) {
      return toast.error("Use at least 8 characters.");
    }
    if (form.password !== form.confirm) {
      return toast.error("Your passwords do not match.");
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: form.password,
      });
      if (error) throw error;
      toast.success("Your password has been updated.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.message || "We could not update your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      image="/images/auth-login.jpg"
      imageAlt="A young South African woman standing confidently in a stone archway courtyard"
      greeting="Sawubona"
      title="Set a new password."
    >
      <p className="text-sm font-semibold text-primary-700">Account recovery</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900">
        Choose a new password
      </h2>

      {status === "checking" && (
        <p className="mt-6 text-sm text-stone-600">Checking your reset link…</p>
      )}

      {status === "invalid" && (
        <div className="mt-6 space-y-4">
          <p className="text-sm leading-6 text-stone-600">
            This reset link has expired or has already been used. Reset links
            are single use, so request a fresh one.
          </p>
          <Link
            to="/forgot-password"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Request a new link <ArrowRight size={17} />
          </Link>
        </div>
      )}

      {status === "ready" && (
        <>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Pick something you have not used before. Eight characters at
            minimum.
          </p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label className="label text-stone-700" htmlFor="password">
                New password
              </label>
              <input
                className="input border-stone-300 py-3"
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label text-stone-700" htmlFor="confirm">
                Confirm new password
              </label>
              <input
                className="input border-stone-300 py-3"
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Repeat your new password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              />
            </div>
            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
            >
              {loading ? "Saving..." : <>Save new password <ArrowRight size={17} /></>}
            </button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
