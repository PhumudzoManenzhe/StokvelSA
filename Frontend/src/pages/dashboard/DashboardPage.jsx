import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Users, Plus, TrendingUp, Wallet } from "lucide-react";
import api from "../../lib/api";
import useAuthStore from "../../stores/authStore";
import StatCard from "../../components/ui/StatCard";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";

export default function DashboardPage() {
  const { profile } = useAuthStore();

  // Fetch user's groups
  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const res = await api.get("/groups");
      return res.data;
    },
  });

  // Fetch SA interest rates
  const { data: ratesData } = useQuery({
    queryKey: ["rates"],
    queryFn: async () => {
      const res = await api.get("/rates");
      return res.data.data.rates;
    },
  });

  const groups = groupsData?.groups || [];
  const totalGroups = groups.length;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div
        className="bg-gradient-to-r from-primary-600 to-primary-700
                      rounded-2xl p-6 text-white"
      >
        <p className="text-primary-200 text-sm font-medium">{greeting()},</p>
        <h2 className="text-2xl font-bold mt-0.5">
          {profile?.fullName?.split(" ")[0]} 👋
        </h2>
        <p className="text-primary-200 text-sm mt-2">
          You are a member of {totalGroups} stokvel
          {totalGroups !== 1 ? "s" : ""}
        </p>

        {ratesData && (
          <div className="flex gap-4 mt-4">
            <div className="bg-white/10 rounded-lg px-3 py-2">
              <p className="text-primary-200 text-xs">Prime Rate</p>
              <p className="text-white font-bold">{ratesData.primeRate}%</p>
            </div>
            <div className="bg-white/10 rounded-lg px-3 py-2">
              <p className="text-primary-200 text-xs">Repo Rate</p>
              <p className="text-white font-bold">{ratesData.repoRate}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Stokvels"
          value={totalGroups}
          icon={<Users size={18} />}
          color="blue"
        />
        <StatCard
          title="Prime Rate"
          value={ratesData ? `${ratesData.primeRate}%` : "—"}
          subtitle="South African prime"
          icon={<TrendingUp size={18} />}
          color="green"
        />
        <StatCard
          title="Total Members"
          value={groups.reduce((sum, g) => sum + (g._count?.members || 0), 0)}
          icon={<Users size={18} />}
          color="purple"
        />
        <StatCard
          title="Repo Rate"
          value={ratesData ? `${ratesData.repoRate}%` : "—"}
          subtitle="SARB repo rate"
          icon={<Wallet size={18} />}
          color="yellow"
        />
      </div>

      {/* My stokvels */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">My Stokvels</h3>
          <Link
            to="/groups/new"
            className="btn-primary flex items-center gap-2 py-2"
          >
            <Plus size={16} />
            New Stokvel
          </Link>
        </div>

        {groupsLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : groups.length === 0 ? (
          <div className="card">
            <EmptyState
              icon="🏦"
              title="No stokvels yet"
              description="Create your first stokvel group or ask someone to invite you"
              action={
                <Link to="/groups/new" className="btn-primary">
                  Create a Stokvel
                </Link>
              }
            />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GroupCard({ group }) {
  const roleColors = {
    ADMIN: "badge-purple",
    TREASURER: "badge-blue",
    MEMBER: "badge-gray",
  };

  return (
    <Link
      to={`/groups/${group.id}`}
      className="card hover:shadow-md transition-shadow cursor-pointer block"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl bg-primary-100 flex items-center
                        justify-center text-xl"
        >
          🏦
        </div>
        <span className={roleColors[group.myRole] || "badge-gray"}>
          {group.myRole}
        </span>
      </div>

      <h4 className="font-semibold text-gray-900 mb-1 truncate">
        {group.name}
      </h4>

      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
        {group.description || "No description"}
      </p>

      <div
        className="flex items-center justify-between text-xs text-gray-400
                      border-t border-gray-100 pt-3"
      >
        <span>{group._count?.members || 0} members</span>
        <span className="font-semibold text-primary-600">
          R{parseFloat(group.contributionAmount).toLocaleString("en-ZA")} /
          month
        </span>
      </div>
    </Link>
  );
}
