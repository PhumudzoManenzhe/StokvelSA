import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Users, Plus, TrendingUp } from "lucide-react";
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
      return res.data.data;
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
  const totalMembers = groups.reduce(
    (sum, group) => sum + (group._count?.members || 0),
    0,
  );

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // `/rates` falls back to a hardcoded pair when the Reserve Bank cannot be
  // reached. Those numbers are still worth showing, but not as though they were
  // just fetched.
  const rateBasis = ratesData
    ? ratesData.fallback || ratesData.stale
      ? "last known figure"
      : `as at ${new Date(ratesData.fetchedAt).toLocaleDateString("en-ZA", {
          day: "numeric",
          month: "short",
        })}`
    : null;

  return (
    <div className="space-y-6">
      {/* Welcome. The landing page opens on a photograph of a stokvel actually
          sitting in a circle; the signed-in home should not feel like a
          different product. */}
      <div className="relative overflow-hidden rounded-2xl bg-primary-900">
        <img
          src="/images/stokvel-circle.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-950/95 via-primary-900/85 to-primary-800/55" />

        <div className="relative p-6 md:p-8">
          <p className="text-sm font-medium text-primary-200">{greeting()},</p>
          <h2 className="mt-0.5 font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">
            {profile?.fullName?.split(" ")[0] || "friend"}
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-primary-100/90">
            {totalGroups > 0
              ? `You are part of ${totalGroups} stokvel${
                  totalGroups === 1 ? "" : "s"
                }, with ${totalMembers} ${
                  totalMembers === 1 ? "person" : "people"
                } in total.`
              : "Your first stokvel is one step away. Start one, or join one a friend already runs."}
          </p>

          {totalGroups === 0 && (
            <Link
              to="/groups/new"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary-900 shadow-sm transition hover:bg-primary-50"
            >
              <Plus size={16} />
              Start a stokvel
            </Link>
          )}
        </div>
      </div>

      {/* Stats. Prime and repo used to appear twice each — once in the banner,
          once here — so two of the four cards carried no new information. */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Active stokvels"
          value={totalGroups}
          icon={<Users size={18} />}
          color="primary"
        />
        <StatCard
          title="People you save with"
          value={totalMembers}
          icon={<Users size={18} />}
          color="purple"
        />
        <StatCard
          title="SA prime rate"
          value={ratesData ? `${ratesData.primeRate}%` : "—"}
          subtitle={
            ratesData ? `Repo ${ratesData.repoRate}% · ${rateBasis}` : undefined
          }
          icon={<TrendingUp size={18} />}
          color="green"
        />
      </div>

      {/* My stokvels */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-stone-900">
            My stokvels
          </h3>
          <Link
            to="/groups/new"
            className="btn-primary flex items-center gap-2 py-2"
          >
            <Plus size={16} />
            New stokvel
          </Link>
        </div>

        {groupsLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : groups.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Users}
              title="No stokvels yet"
              description="Create your first stokvel group, or ask a friend to invite you to one they already run."
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
      <div className="mb-3 flex items-start justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 font-display text-lg font-semibold text-primary-700 ring-1 ring-primary-100">
          {group.name?.charAt(0).toUpperCase() || "S"}
        </div>
        <span className={roleColors[group.myRole] || "badge-gray"}>
          {group.myRole}
        </span>
      </div>

      <h4 className="mb-1 truncate font-semibold text-stone-900">
        {group.name}
      </h4>

      <p className="mb-3 line-clamp-2 text-sm text-stone-500">
        {group.description || "No description"}
      </p>

      <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-stone-500">
        <span>{group._count?.members || 0} members</span>
        <span className="font-semibold text-primary-700">
          R{parseFloat(group.contributionAmount).toLocaleString("en-ZA")} /
          month
        </span>
      </div>
    </Link>
  );
}
