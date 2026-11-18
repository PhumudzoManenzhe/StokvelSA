import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/authStore";
import { Wordmark } from "../ui/BrandMark";
import {
  LayoutDashboard,
  Users,
  Bell,
  User,
  LogOut,
  X,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/groups", icon: Users, label: "My stokvels" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function Sidebar({ open, onClose }) {
  const { logout, profile } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("You have signed out");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-stone-950/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
        fixed left-0 top-0 z-30 flex h-full w-64 flex-col border-r
        border-stone-200/80 bg-white transition-transform duration-300
        lg:static lg:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Mark. The app used to open with a bank emoji, which said "branch"
            where the whole point is that this is people, not a bank. */}
        <div className="flex items-start justify-between gap-2 border-b border-stone-200/80 p-5">
          <div>
            <Wordmark to="/dashboard" />
            <p className="mt-1 pl-[46px] text-[11px] font-medium uppercase tracking-wider text-stone-400">
              Digital stokvel
            </p>
          </div>
          <button
            onClick={onClose}
            className="-mr-1 rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {profile && (
          <div className="border-b border-stone-200/80 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-100 text-sm font-semibold text-primary-800 ring-2 ring-white">
                {profile.fullName?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-stone-900">
                  {profile.fullName || "Your account"}
                </p>
                <p className="truncate text-xs text-stone-500">
                  {profile.email}
                </p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1 p-3" aria-label="Main navigation">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `
                group relative flex items-center gap-3 rounded-lg px-3 py-2.5
                text-sm font-medium transition-colors
                ${
                  isActive
                    ? "bg-primary-50 text-primary-800"
                    : "text-stone-600 hover:bg-stone-100/80 hover:text-stone-900"
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {/* The tab on the left edge is what your eye uses to find
                      "where am I" without reading anything. */}
                  <span
                    className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary-600 transition-opacity ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.9} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-stone-200/80 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={18} strokeWidth={1.9} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
