import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Bell, ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/groups": "My Stokvels",
  "/groups/new": "Create Stokvel",
  "/notifications": "Notifications",
  "/profile": "Profile",
};

export default function Header({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  const title = pageTitles[location.pathname] || "StokvelSA";

  const canGoBack =
    location.pathname !== "/dashboard" && location.pathname !== "/groups";

  // Unread notification count
  const { data } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: async () => {
      const res = await api.get("/notifications?read=false&limit=1");
      return res.data.unreadCount;
    },
    refetchInterval: 30000, // check every 30 seconds
  });

  const unreadCount = data || 0;

  return (
    <header
      className="sticky top-0 z-10 bg-white border-b border-gray-100
                       px-4 md:px-6 h-16 flex items-center gap-4"
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-500 hover:text-gray-700"
      >
        <Menu size={22} />
      </button>

      {/* Back button */}
      {canGoBack && (
        <button
          onClick={() => navigate(-1)}
          className="hidden md:flex items-center gap-1 text-gray-500
                     hover:text-gray-700 text-sm"
        >
          <ChevronLeft size={16} />
          Back
        </button>
      )}

      {/* Title */}
      <h1 className="text-lg font-semibold text-gray-900 flex-1">{title}</h1>

      {/* Notification bell */}
      <button
        onClick={() => navigate("/notifications")}
        className="relative p-2 text-gray-500 hover:text-gray-700
                   hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500
                           rounded-full"
          />
        )}
      </button>
    </header>
  );
}
