import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
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
      return res.data;
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
          <h2 className="text-xl font-bold text-gray-900">My Stokvels</h2>
          <p className="text-sm text-gray-500">
            Manage all your stokvel groups in one place
          </p>
        </div>
        <Link to="/groups/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          New Stokvel
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2
                                     text-gray-400"
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
            icon="🏦"
            title={search ? "No stokvels found" : "No stokvels yet"}
            description={
              search
                ? `No stokvels match "${search}"`
                : "Create your first stokvel or accept an invitation"
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
        <div
          className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center
                        justify-center text-2xl shrink-0"
        >
          🏦
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 truncate">
              {group.name}
            </h4>
            <span className={`${roleColors[group.myRole]} shrink-0`}>
              {group.myRole}
            </span>
          </div>
          <p className="text-sm text-gray-500 truncate">
            {group.description || "No description"}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>{group._count?.members || 0} members</span>
            <span>•</span>
            <span className="text-primary-600 font-medium">
              R{parseFloat(group.contributionAmount).toLocaleString("en-ZA")}{" "}
              {freqLabel[group.contributionFrequency]}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
