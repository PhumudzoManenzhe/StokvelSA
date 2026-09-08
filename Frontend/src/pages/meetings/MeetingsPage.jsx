import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import { format } from "date-fns";
import { MapPin, Users } from "lucide-react";

export default function MeetingsPage() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["meetings", id],
    queryFn: async () => {
      const res = await api.get(`/groups/${id}/meetings`);
      return res.data;
    },
  });

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );

  const meetings = data?.meetings || [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Meetings</h2>

      <div className="space-y-4">
        {meetings.length === 0 ? (
          <div className="card">
            <p className="text-center text-gray-400 py-8">
              No meetings scheduled yet
            </p>
          </div>
        ) : (
          meetings.map((m) => (
            <div key={m.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{m.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(m.date), "EEEE, dd MMMM yyyy · HH:mm")}
                  </p>
                  {m.location && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin size={12} />
                      {m.location}
                    </p>
                  )}
                </div>
                <Badge label={m.status} />
              </div>

              {m.agenda && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Agenda
                  </p>
                  <p className="text-sm text-gray-700">{m.agenda}</p>
                </div>
              )}

              <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                <Users size={12} />
                {m._count?.attendees || 0} invited
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
