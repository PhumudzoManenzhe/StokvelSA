import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import { format } from "date-fns";

export default function ContributionsPage() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["contributions", id],
    queryFn: async () => {
      const res = await api.get(`/groups/${id}/contributions`);
      return res.data;
    },
  });

  const { data: summary } = useQuery({
    queryKey: ["contributions", id, "summary"],
    queryFn: async () => {
      const res = await api.get(`/groups/${id}/contributions/summary`);
      return res.data.data.summary;
    },
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
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
