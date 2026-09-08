import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import { format } from "date-fns";

export default function PayoutsPage() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["payouts", id],
    queryFn: async () => {
      const res = await api.get(`/groups/${id}/payouts`);
      return res.data;
    },
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
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
