import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail } from "lucide-react";
import api from "../../lib/api";
import useAuthStore from "../../stores/authStore";

// Reached from the link in the invitation email: /join?code=XXXXXXXX
export default function JoinGroupPage() {
  const [params] = useSearchParams();
  const code = params.get("code");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile } = useAuthStore();
  const [error, setError] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.post(`/groups/invitations/${code}/accept`),
    onSuccess: (res) => {
      const { group } = res.data.data;
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success(`You have joined ${group.name}`);
      navigate(`/groups/${group.id}`, { replace: true });
    },
    onError: (err) => {
      setError(
        err.response?.data?.error || "This invitation could not be accepted",
      );
    },
  });

  if (!code) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-10 text-center">
        <h2 className="font-display text-xl font-semibold text-stone-900">
          This invitation link is incomplete
        </h2>
        <p className="text-sm leading-6 text-stone-600">
          The link is missing its invitation code. Ask whoever invited you to
          resend it.
        </p>
        <Link to="/dashboard" className="btn-secondary">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg py-10">
      <div className="card space-y-5 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
          <Mail size={22} />
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-stone-900">
            You have been invited to a stokvel
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Accepting adds you as a member of the group, with the role the
            administrator chose for you.
          </p>
        </div>

        <div className="rounded-xl bg-stone-50 px-4 py-3 ring-1 ring-stone-200/70">
          <p className="text-xs uppercase tracking-wide text-stone-500">
            Invitation code
          </p>
          <p className="mt-1 font-mono text-lg font-semibold tracking-widest text-stone-900">
            {code}
          </p>
        </div>

        {/* The API only accepts an invitation for the address it was sent to,
            so name the signed-in account when it does not match. */}
        {profile?.email && (
          <p className="text-xs text-stone-500">
            Signed in as {profile.email}
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Link to="/dashboard" className="btn-secondary flex-1">
            Not now
          </Link>
          <button
            onClick={() => {
              setError("");
              mutate();
            }}
            disabled={isPending}
            className="btn-primary flex-1"
          >
            {isPending ? "Joining..." : "Accept invitation"}
          </button>
        </div>
      </div>
    </div>
  );
}
