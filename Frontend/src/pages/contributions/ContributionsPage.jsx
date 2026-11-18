import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../lib/api";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
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
      <h2 className="text-xl font-bold text-gray-900">Contributions</h2>

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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card text-center">
            <p className="text-2xl font-bold text-green-600">
              {summary.confirmed}
            </p>
            <p className="text-xs text-gray-500 mt-1">Confirmed</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {summary.pending}
            </p>
            <p className="text-xs text-gray-500 mt-1">Pending</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-red-600">{summary.missed}</p>
            <p className="text-xs text-gray-500 mt-1">Missed</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-primary-600">
              {summary.complianceRate}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Compliance</p>
          </div>
        </div>
      )}

      {/* Contributions list */}
      <div className="card">
        <div className="space-y-3">
          {contributions.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              No contributions yet for this period
            </p>
          ) : (
            contributions.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between
                                         py-3 border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {c.member?.fullName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {c.period} · Due{" "}
                    {format(new Date(c.dueDate), "dd MMM yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">
                    R{parseFloat(c.amount).toLocaleString("en-ZA")}
                  </span>
                  <Badge label={c.status} />
                  {canManage && c.status === "PENDING" && (
                    <>
                      <button
                        onClick={() =>
                          mark({ contributionId: c.id, action: "confirm" })
                        }
                        className="text-xs font-medium text-green-700 hover:underline"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() =>
                          mark({ contributionId: c.id, action: "missed" })
                        }
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Missed
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
