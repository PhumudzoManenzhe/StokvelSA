import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import api from "../../lib/api";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get("/notifications");
      return res.data.data;
    },
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const { mutate: markRead } = useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-stone-900">
            Notifications
          </h2>
          <p className="text-sm text-stone-500">
            {unreadCount > 0
              ? `${unreadCount} still unread`
              : "You are all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead()}
            className="btn-secondary flex items-center gap-2 py-1.5 text-xs"
          >
            <Check size={14} />
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Bell}
              title="Nothing here yet"
              description="When someone invites you, adds a contribution or schedules a meeting, it will appear here."
            />
          </div>
        ) : (
          notifications.map((notification) => (
            /* A row that reacts to a click has to be reachable from the
               keyboard too, so it is a button rather than a div. */
            <button
              key={notification.id}
              type="button"
              onClick={() => !notification.read && markRead(notification.id)}
              disabled={notification.read}
              className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                notification.read
                  ? "cursor-default border-stone-200/70 bg-white"
                  : "border-stone-200/70 bg-white hover:border-primary-200 hover:bg-primary-50/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
                    notification.read ? "bg-stone-200" : "bg-primary-600"
                  }`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm ${
                      notification.read
                        ? "text-stone-600"
                        : "font-medium text-stone-900"
                    }`}
                  >
                    {notification.message}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                    {!notification.read && (
                      <span className="sr-only"> — unread</span>
                    )}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
