import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Search, SearchX, Users } from "lucide-react";
import { useState } from "react";
import api from "../../lib/api";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";

export default function GroupsPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const res = await api.get("/groups");
      return res.data.data;
    },
  });

  const groups = (data?.groups || []).filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center
                      justify-between"
      >
        <div>
          <h2 className="font-display text-xl font-semibold text-stone-900">
            My stokvels
          </h2>
          <p className="text-sm text-stone-600">
            Every circle you belong to, in one place
          </p>
        </div>
        <Link to="/groups/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          New stokvel
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2
                                     text-stone-400"
        />
        <input
          type="text"
          placeholder="Search stokvels..."
          className="input pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : groups.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={search ? SearchX : Users}
            title={search ? "No stokvels found" : "No stokvels yet"}
            description={
              search
                ? `Nothing matches "${search}". Try a shorter name.`
                : "Create your first stokvel, or accept an invitation from someone who already has one."
            }
            action={
              !search && (
                <Link to="/groups/new" className="btn-primary">
                  Create Stokvel
                </Link>
              )
            }
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <GroupRow key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}

function GroupRow({ group }) {
  const roleColors = {
    ADMIN: "badge-purple",
    TREASURER: "badge-blue",
    MEMBER: "badge-gray",
  };

  const freqLabel = {
    WEEKLY: "weekly",
    MONTHLY: "monthly",
    QUARTERLY: "quarterly",
  };

  return (
    <Link
      to={`/groups/${group.id}`}
      className="card hover:shadow-md transition-all hover:-translate-y-0.5
                 cursor-pointer block"
    >
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-50 font-display text-xl font-semibold text-primary-700 ring-1 ring-primary-100">
          {group.name?.charAt(0).toUpperCase() || "S"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h4 className="truncate font-semibold text-stone-900">
              {group.name}
            </h4>
            <span className={`${roleColors[group.myRole]} shrink-0`}>
              {group.myRole}
            </span>
          </div>
          <p className="truncate text-sm text-stone-500">
            {group.description || "No description"}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs text-stone-500">
            <span>{group._count?.members || 0} members</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-primary-700">
              R{parseFloat(group.contributionAmount).toLocaleString("en-ZA")}{" "}
              {freqLabel[group.contributionFrequency]}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
