import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Phone, Mail, AlertTriangle } from "lucide-react";
import api from "../../lib/api";
import useAuthStore from "../../stores/authStore";

export default function ProfilePage() {
  const { profile, fetchProfile, logout } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: profile?.fullName || "",
    phone: profile?.phone || "",
  });
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => api.patch("/auth/me", data),
    onSuccess: async () => {
      await fetchProfile();
      toast.success("Your details are saved");
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Could not save your details");
    },
  });

  /* The button used to have no handler at all: it promised that deleting was
     permanent and then did nothing when pressed. */
  const { mutate: deleteAccount, isPending: deleting } = useMutation({
    mutationFn: () => api.delete("/auth/account"),
    onSuccess: async () => {
      try {
        await logout();
      } catch {
        // The account is already gone from Supabase, so a failed sign-out is
        // not something the person can act on.
      }
      toast.success("Your account has been deleted");
      navigate("/", { replace: true });
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.error || "Could not delete your account",
      );
    },
  });

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-ZA", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-stone-900">
          Profile
        </h2>
        <p className="text-sm text-stone-600">
          How the other members see you in the group.
        </p>
      </div>

      <div className="card flex items-center gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary-50 font-display text-2xl font-semibold text-primary-700 ring-1 ring-primary-100">
          {profile?.fullName?.charAt(0).toUpperCase() || "?"}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-stone-900">
            {profile?.fullName || "Your account"}
          </p>
          <p className="truncate text-sm text-stone-600">{profile?.email}</p>
          {memberSince && (
            <p className="mt-1 text-xs text-stone-500">
              Member since {memberSince}
            </p>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="font-display text-lg font-semibold text-stone-900">
          Your details
        </h3>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            mutate(form);
          }}
          className="mt-4 space-y-4"
        >
          <div>
            <label className="label" htmlFor="fullName">
              Full name
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                id="fullName"
                className="input pl-9"
                value={form.fullName}
                onChange={(e) =>
                  setForm((previous) => ({
                    ...previous,
                    fullName: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="email">
              Email address
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                id="email"
                className="input pl-9"
                value={profile?.email || ""}
                disabled
              />
            </div>
            <p className="mt-1 text-xs text-stone-500">
              Your email is how you sign in, so it cannot be changed here.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="phone">
              Phone number
            </label>
            <div className="relative">
              <Phone
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                id="phone"
                className="input pl-9"
                placeholder="+27 82 123 4567"
                value={form.phone}
                onChange={(e) =>
                  setForm((previous) => ({
                    ...previous,
                    phone: e.target.value,
                  }))
                }
              />
            </div>
            <p className="mt-1 text-xs text-stone-500">
              So your treasurer can reach you without going through email.
            </p>
          </div>

          <button type="submit" disabled={isPending} className="btn-primary w-full">
            {isPending ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>

      <div className="card border-red-100">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-red-700">
          <AlertTriangle size={18} />
          Delete account
        </h3>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          This removes your access for good. Contributions and payouts you
          already recorded stay with the stokvel, because the group still needs
          its own history.
        </p>

        {confirmingDelete ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => deleteAccount()}
              disabled={deleting}
              className="btn-danger"
            >
              {deleting ? "Deleting…" : "Yes, delete my account"}
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              className="btn-secondary"
            >
              Keep my account
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="btn-secondary mt-4 border-red-200 text-red-700 hover:bg-red-50"
          >
            Delete my account
          </button>
        )}
      </div>
    </div>
  );
}
