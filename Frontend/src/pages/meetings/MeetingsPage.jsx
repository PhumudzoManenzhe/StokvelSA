import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../lib/api";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import { format } from "date-fns";
import { MapPin, Users } from "lucide-react";

export default function MeetingsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    date: "",
    location: "",
    agenda: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["meetings", id],
    queryFn: async () => {
      const res = await api.get(`/groups/${id}/meetings`);
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

  // Admins and treasurers may schedule; only an administrator may cancel.
  const canManage = ["ADMIN", "TREASURER"].includes(group?.myRole);
  const isAdmin = group?.myRole === "ADMIN";

  const { mutate: schedule, isPending: scheduling } = useMutation({
    mutationFn: () => api.post(`/groups/${id}/meetings`, form),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["meetings", id] });
      toast.success(`Scheduled ${res.data.data.meeting.title}`);
      setForm({ title: "", date: "", location: "", agenda: "" });
    },
    onError: (err) =>
      toast.error(err.response?.data?.error || "Could not schedule the meeting"),
  });

  const { mutate: cancel } = useMutation({
    mutationFn: (meetingId) => api.delete(`/groups/${id}/meetings/${meetingId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings", id] });
      toast.success("Meeting cancelled");
    },
    onError: (err) =>
      toast.error(err.response?.data?.error || "Could not cancel the meeting"),
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

      {canManage && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            schedule();
          }}
          className="card space-y-3"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                required
                className="input"
                placeholder="Monthly meeting"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="date">
                Date and time
              </label>
              <input
                id="date"
                type="datetime-local"
                required
                className="input"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="location">
                Location
              </label>
              <input
                id="location"
                className="input"
                placeholder="Where the group meets"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="agenda">
                Agenda
              </label>
              <input
                id="agenda"
                className="input"
                placeholder="What will be discussed"
                value={form.agenda}
                onChange={(e) => setForm({ ...form, agenda: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button disabled={scheduling} className="btn-primary">
              {scheduling ? "Scheduling..." : "Schedule meeting"}
            </button>
          </div>
        </form>
      )}

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
                <div className="flex flex-col items-end gap-2">
                  <Badge label={m.status} />
                  {isAdmin && m.status === "SCHEDULED" && (
                    <button
                      onClick={() => cancel(m.id)}
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>
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
