import { NavLink, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/authStore";
import {
  LayoutDashboard,
  Users,
  Wallet,
  CreditCard,
  CalendarDays,
  BarChart3,
  Bell,
  User,
  LogOut,
  X,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/groups", icon: Users, label: "My Stokvels" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function Sidebar({ open, onClose }) {
  const { logout, profile } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100
        z-30 flex flex-col transition-transform duration-300
        lg:static lg:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-lg">🏦</span>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">StokvelSA</p>
                <p className="text-xs text-gray-400">Digital Stokvel</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* User info */}
        {profile && (
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full bg-primary-100 flex items-center
                              justify-center text-primary-700 font-semibold text-sm"
              >
                {profile.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile.fullName}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {profile.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                font-medium transition-colors
                ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                       font-medium text-gray-600 hover:bg-red-50 hover:text-red-600
                       transition-colors w-full"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
