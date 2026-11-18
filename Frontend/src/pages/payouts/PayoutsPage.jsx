import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../lib/api";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
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
      <h2 className="text-xl font-bold text-gray-900">Payouts</h2>

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
        <div className="space-y-3">
          {payouts.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              No payouts scheduled yet
            </p>
          ) : (
            payouts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between
                                         py-3 border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {p.recipient?.fullName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(p.scheduledDate), "dd MMM yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">
                    R{parseFloat(p.amount).toLocaleString("en-ZA")}
                  </span>
                  <Badge label={p.status} />
                  {canManage && p.status === "SCHEDULED" && (
                    <>
                      <button
                        onClick={() =>
                          settle({ payoutId: p.id, action: "complete" })
                        }
                        className="text-xs font-medium text-green-700 hover:underline"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() =>
                          settle({ payoutId: p.id, action: "failed" })
                        }
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Failed
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
