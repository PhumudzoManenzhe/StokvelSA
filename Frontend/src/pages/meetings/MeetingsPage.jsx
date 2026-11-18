import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../lib/api";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { format } from "date-fns";
import { CalendarDays, MapPin, Users } from "lucide-react";

export default function MeetingsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [confirmingCancel, setConfirmingCancel] = useState(null);
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

  // The question a member actually has is "when do we meet next?", so upcoming
  // meetings lead and past ones follow, instead of the list arriving in
  // whatever order the database returned.
  const byDate = (a, b) => new Date(a.date) - new Date(b.date);
  const upcoming = meetings
    .filter((meeting) => meeting.status === "SCHEDULED")
    .sort(byDate);
  const settled = meetings
    .filter((meeting) => meeting.status !== "SCHEDULED")
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const renderMeeting = (meeting) => (
    <div key={meeting.id} className="card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h4 className="font-semibold text-stone-900">{meeting.title}</h4>
          <p className="mt-1 text-sm text-stone-600">
            {format(new Date(meeting.date), "EEEE, dd MMMM yyyy · HH:mm")}
          </p>
          {meeting.location && (
            <p className="mt-1 flex items-center gap-1 text-xs text-stone-500">
              <MapPin size={12} />
              {meeting.location}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Badge label={meeting.status} />
          {isAdmin && meeting.status === "SCHEDULED" && (
            <>
              {confirmingCancel === meeting.id ? (
                <span className="flex items-center gap-2 text-xs">
                  <span className="text-stone-600">Cancel it?</span>
                  <button
                    onClick={() => cancel(meeting.id)}
                    className="rounded-lg bg-red-50 px-2 py-1 font-semibold text-red-700 hover:bg-red-100"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmingCancel(null)}
                    className="rounded-lg px-2 py-1 font-medium text-stone-600 hover:bg-stone-100"
                  >
                    No
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirmingCancel(meeting.id)}
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Cancel
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {meeting.agenda && (
        <div className="mt-3 rounded-lg bg-stone-50 p-3">
          <p className="mb-1 text-xs font-medium text-stone-500">Agenda</p>
          <p className="text-sm text-stone-700">{meeting.agenda}</p>
        </div>
      )}

      <div className="mt-3 flex items-center gap-1 text-xs text-stone-500">
        <Users size={12} />
        {meeting._count?.attendees || 0} invited
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-stone-900">
          Meetings
        </h2>
        <p className="text-sm text-stone-600">
          The stokvel doing its business: when you meet, where, and what is on
          the table.
        </p>
      </div>

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
              {scheduling ? "Scheduling…" : "Schedule meeting"}
            </button>
          </div>
        </form>
      )}

      {meetings.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={CalendarDays}
            title="No meetings scheduled"
            description={
              canManage
                ? "Set the next date above. Members will see it here, with the agenda."
                : "Once your chairperson schedules the next meeting, the date and agenda will appear here."
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Coming up
              </h3>
              {upcoming.map(renderMeeting)}
            </div>
          )}

          {settled.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Past
              </h3>
              {settled.map(renderMeeting)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
