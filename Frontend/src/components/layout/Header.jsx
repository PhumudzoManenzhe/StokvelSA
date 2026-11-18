import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Bell, ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";

// Keyed by the last path segment, because a group id says nothing useful.
const TITLES = {
  dashboard: "Dashboard",
  groups: "My stokvels",
  new: "Create a stokvel",
  notifications: "Notifications",
  profile: "Profile",
  contributions: "Contributions",
  payouts: "Payouts",
  meetings: "Meetings",
  analytics: "Analytics",
  join: "Join a stokvel",
};

function titleFor(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "StokvelSA";

  const last = segments[segments.length - 1];
  if (TITLES[last]) return TITLES[last];

  // /groups/:id — the page is a single stokvel, so name it as one.
  if (segments[0] === "groups" && segments.length === 2) return "Stokvel";

  return "StokvelSA";
}

export default function Header({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  const title = titleFor(location.pathname);

  const canGoBack =
    location.pathname !== "/dashboard" && location.pathname !== "/groups";

  // Unread notifications. The envelope is { success, data, meta }, so the count
  // sits one level deeper than it first appears.
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: async () => {
      const res = await api.get("/notifications?read=false&limit=1");
      return res.data?.data?.unreadCount ?? 0;
    },
    refetchInterval: 30000,
  });

  const badge = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-stone-200/80 bg-white/90 px-4 backdrop-blur md:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-1.5 text-stone-500 transition hover:bg-stone-100 hover:text-stone-700 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={22} />
      </button>

      {canGoBack && (
        <button
          onClick={() => navigate(-1)}
          className="hidden items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-stone-500 transition hover:bg-stone-100 hover:text-stone-700 md:flex"
        >
          <ChevronLeft size={16} />
          Back
        </button>
      )}

      <h1 className="flex-1 truncate font-display text-lg font-semibold text-stone-900">
        {title}
      </h1>

      <button
        onClick={() => navigate("/notifications")}
        className="relative rounded-lg p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-700"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white">
            {badge}
          </span>
        )}
      </button>
    </header>
  );
}
