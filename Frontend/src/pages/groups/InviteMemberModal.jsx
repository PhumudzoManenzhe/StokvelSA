import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Check, Copy, X } from "lucide-react";
import api from "../../lib/api";

export default function InviteMemberModal({ groupId, onClose }) {
  const [form, setForm] = useState({ email: "", role: "MEMBER" });
  const [invitation, setInvitation] = useState(null);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => api.post(`/groups/${groupId}/invite`, data),
    onSuccess: (res) => {
      const data = res.data.data;
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      /* The code used to be shown in a toast, which disappears. That code is
         the whole point: it is what you paste into a WhatsApp group when the
         email does not arrive, so it stays on screen until dismissed. */
      setInvitation({ email: form.email, code: data.code });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Could not send the invitation");
    },
  });

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(invitation.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy — select the code and copy it yourself");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-title"
        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-200/80 p-5">
          <h3
            id="invite-title"
            className="font-display text-lg font-semibold text-stone-900"
          >
            {invitation ? "Invitation ready" : "Invite a member"}
          </h3>
          <button
            onClick={onClose}
            className="-mr-1 rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {invitation ? (
          <div className="space-y-4 p-5">
            <p className="text-sm leading-6 text-stone-600">
              We emailed an invitation to{" "}
              <strong className="text-stone-900">{invitation.email}</strong>.
              If it does not arrive, send them this code instead.
            </p>

            <div className="rounded-xl bg-stone-50 p-4 text-center ring-1 ring-stone-200/70">
              <p className="text-xs uppercase tracking-wide text-stone-500">
                Invitation code
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tracking-[0.2em] text-stone-900">
                {invitation.code}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={copyCode}
                className="btn-secondary flex flex-1 items-center justify-center gap-2"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy code"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-primary flex-1"
              >
                Done
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setInvitation(null);
                setForm({ email: "", role: "MEMBER" });
              }}
              className="w-full text-xs font-medium text-stone-500 underline-offset-2 hover:text-stone-800 hover:underline"
            >
              Invite someone else
            </button>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              mutate(form);
            }}
            className="space-y-4 p-5"
          >
            <div>
              <label className="label" htmlFor="invite-email">
                Email address
              </label>
              <input
                id="invite-email"
                type="email"
                required
                autoFocus
                className="input"
                placeholder="member@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm((previous) => ({ ...previous, email: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="label" htmlFor="invite-role">
                Role
              </label>
              <select
                id="invite-role"
                className="input"
                value={form.role}
                onChange={(e) =>
                  setForm((previous) => ({ ...previous, role: e.target.value }))
                }
              >
                <option value="MEMBER">Member</option>
                <option value="TREASURER">Treasurer</option>
              </select>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                A treasurer can confirm contributions and schedule payouts.
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="btn-primary flex-1"
              >
                {isPending ? "Sending…" : "Send invitation"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
