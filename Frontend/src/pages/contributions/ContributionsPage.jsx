import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Wallet } from "lucide-react";
import api from "../../lib/api";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { format } from "date-fns";

export default function ContributionsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [dueDate, setDueDate] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["contributions", id],
    queryFn: async () => {
      const res = await api.get(`/groups/${id}/contributions`);
      return res.data.data;
    },
  });

  // The member's role in this group decides which calls the API will accept, so
  // the same role decides which controls are shown. Shared cache key with the
  // group page.
  const { data: group } = useQuery({
    queryKey: ["group", id],
    queryFn: async () => {
      const res = await api.get(`/groups/${id}`);
      return res.data.data.group;
    },
  });

  const canManage = ["ADMIN", "TREASURER"].includes(group?.myRole);

  // Summary is an admin/treasurer endpoint, so a member asking for it is a
  // guaranteed 403. It waits until the role is known.
  const { data: summary } = useQuery({
    queryKey: ["contributions", id, "summary"],
    enabled: canManage,
    queryFn: async () => {
      const res = await api.get(`/groups/${id}/contributions/summary`);
      return res.data.data.summary;
    },
  });

  const { mutate: generate, isPending: generating } = useMutation({
    mutationFn: () =>
      api.post(`/groups/${id}/contributions/generate`, { period, dueDate }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["contributions", id] });
      toast.success(
        `Opened ${res.data.data.count} contribution(s) for ${period}`,
      );
    },
    onError: (err) =>
      toast.error(err.response?.data?.error || "Could not open the period"),
  });

  const { mutate: mark } = useMutation({
    mutationFn: ({ contributionId, action }) =>
      api.patch(`/groups/${id}/contributions/${contributionId}/${action}`),
    onSuccess: (_res, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["contributions", id] });
      toast.success(
        action === "confirm"
          ? "Contribution confirmed"
          : "Contribution flagged as missed",
      );
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.error || "Could not update the contribution",
      ),
  });

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );

  const contributions = data?.contributions || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-stone-900">
          Contributions
        </h2>
        <p className="text-sm text-stone-600">
          {canManage
            ? "Open a period to raise this month's contribution for every active member, then confirm each payment as it comes in."
            : "What you owe, and what you have already paid."}
        </p>
      </div>

      {/* Opening a period creates this month's contribution for every active
          member, which is the treasurer's starting point. */}
      {canManage && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            generate();
          }}
          className="card flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label className="label" htmlFor="period">
              Contribution period
            </label>
            <input
              id="period"
              type="month"
              required
              className="input"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="label" htmlFor="dueDate">
              Due date
            </label>
            <input
              id="dueDate"
              type="date"
              required
              className="input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <button disabled={generating} className="btn-primary">
            {generating ? "Opening..." : "Open period"}
          </button>
        </form>
      )}

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="card text-center">
            <p className="font-display text-2xl font-semibold text-emerald-700">
              {summary.confirmed}
            </p>
            <p className="mt-1 text-xs text-stone-500">Confirmed</p>
          </div>
          <div className="card text-center">
            <p className="font-display text-2xl font-semibold text-amber-700">
              {summary.pending}
            </p>
            <p className="mt-1 text-xs text-stone-500">Pending</p>
          </div>
          <div className="card text-center">
            <p className="font-display text-2xl font-semibold text-red-700">
              {summary.missed}
            </p>
            <p className="mt-1 text-xs text-stone-500">Missed</p>
          </div>
          <div className="card text-center">
            <p className="font-display text-2xl font-semibold text-primary-700">
              {summary.complianceRate}%
            </p>
            <p className="mt-1 text-xs text-stone-500">Compliance</p>
          </div>
        </div>
      )}

      {/* Contributions list */}
      <div className="card">
        {contributions.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No contributions for this period"
            description={
              canManage
                ? "Choose a month and a due date above to open the period for everyone."
                : "Once your treasurer opens the period, this month's contribution will appear here."
            }
          />
        ) : (
          <div className="space-y-1">
            {contributions.map((contribution) => (
              <div
                key={contribution.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 py-3 last:border-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-stone-900">
                    {contribution.member?.fullName}
                  </p>
                  <p className="text-xs text-stone-500">
                    {contribution.period} · due{" "}
                    {format(new Date(contribution.dueDate), "dd MMM yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums text-stone-900">
                    R{parseFloat(contribution.amount).toLocaleString("en-ZA")}
                  </span>
                  <Badge label={contribution.status} />
                  {canManage && contribution.status === "PENDING" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          mark({
                            contributionId: contribution.id,
                            action: "confirm",
                          })
                        }
                        className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                      >
                        Confirm paid
                      </button>
                      <button
                        onClick={() =>
                          mark({
                            contributionId: contribution.id,
                            action: "missed",
                          })
                        }
                        className="rounded-lg px-2.5 py-1 text-xs font-medium text-stone-600 transition hover:bg-red-50 hover:text-red-700"
                      >
                        Missed
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
