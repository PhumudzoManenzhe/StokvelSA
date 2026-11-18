import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Banknote } from "lucide-react";
import api from "../../lib/api";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { format } from "date-fns";

export default function PayoutsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    recipientId: "",
    amount: "",
    scheduledDate: new Date().toISOString().slice(0, 10),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["payouts", id],
    queryFn: async () => {
      const res = await api.get(`/groups/${id}/payouts`);
      return res.data.data;
    },
  });

  const { data: group } = useQuery({
    queryKey: ["group", id],
    queryFn: async () => {
      const res = await api.get(`/groups/${id}`);
      return res.data.data.group;
    },
  });

  // Scheduling is an administrator action and settling is admin/treasurer, so
  // the role from the group decides which controls exist at all.
  const canManage = ["ADMIN", "TREASURER"].includes(group?.myRole);
  const isAdmin = group?.myRole === "ADMIN";
  const members = group?.members || [];

  const { mutate: schedule, isPending: scheduling } = useMutation({
    mutationFn: () => api.post(`/groups/${id}/payouts`, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payouts", id] });
      toast.success("Payout scheduled");
      setForm((current) => ({ ...current, recipientId: "", amount: "" }));
    },
    onError: (err) =>
      toast.error(err.response?.data?.error || "Could not schedule the payout"),
  });

  const { mutate: settle } = useMutation({
    mutationFn: ({ payoutId, action }) =>
      api.patch(`/groups/${id}/payouts/${payoutId}/${action}`),
    onSuccess: (_res, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["payouts", id] });
      toast.success(
        action === "complete" ? "Payout completed" : "Payout marked failed",
      );
    },
    onError: (err) =>
      toast.error(err.response?.data?.error || "Could not update the payout"),
  });

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );

  const payouts = data?.payouts || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-stone-900">
          Payouts
        </h2>
        <p className="text-sm text-stone-600">
          {isAdmin
            ? "The pot goes to one member at a time. Schedule each payout here and mark it settled once the money has moved."
            : "Who has been paid, and who is still waiting."}
        </p>
      </div>

      {/* Only an administrator may schedule a payout, which is why this form is
          gated on the role rather than on the endpoint refusing it. */}
      {isAdmin && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            schedule();
          }}
          className="card flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label className="label" htmlFor="recipientId">
              Recipient
            </label>
            <select
              id="recipientId"
              required
              className="input"
              value={form.recipientId}
              onChange={(e) =>
                setForm({ ...form, recipientId: e.target.value })
              }
            >
              <option value="">Choose a member</option>
              {members.map((member) => (
                <option key={member.user.id} value={member.user.id}>
                  {member.user.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-36">
            <label className="label" htmlFor="amount">
              Amount (R)
            </label>
            <input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              required
              className="input"
              placeholder="500.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div className="sm:w-44">
            <label className="label" htmlFor="scheduledDate">
              Scheduled date
            </label>
            <input
              id="scheduledDate"
              type="date"
              required
              className="input"
              value={form.scheduledDate}
              onChange={(e) =>
                setForm({ ...form, scheduledDate: e.target.value })
              }
            />
          </div>
          <button disabled={scheduling} className="btn-primary">
            {scheduling ? "Scheduling..." : "Schedule payout"}
          </button>
        </form>
      )}

      <div className="card">
        {payouts.length === 0 ? (
          <EmptyState
            icon={Banknote}
            title="No payouts yet"
            description={
              isAdmin
                ? "Choose who receives the pot next and when, using the form above."
                : "When your administrator schedules the next payout, it will appear here with its date."
            }
          />
        ) : (
          <div className="space-y-1">
            {payouts.map((payout) => (
              <div
                key={payout.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 py-3 last:border-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-stone-900">
                    {payout.recipient?.fullName}
                  </p>
                  <p className="text-xs text-stone-500">
                    {format(new Date(payout.scheduledDate), "dd MMM yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums text-stone-900">
                    R{parseFloat(payout.amount).toLocaleString("en-ZA")}
                  </span>
                  <Badge label={payout.status} />
                  {canManage && payout.status === "SCHEDULED" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          settle({ payoutId: payout.id, action: "complete" })
                        }
                        className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                      >
                        Mark paid
                      </button>
                      <button
                        onClick={() =>
                          settle({ payoutId: payout.id, action: "failed" })
                        }
                        className="rounded-lg px-2.5 py-1 text-xs font-medium text-stone-600 transition hover:bg-red-50 hover:text-red-700"
                      >
                        Failed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
