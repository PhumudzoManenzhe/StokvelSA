import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Wallet,
  CreditCard,
  CalendarDays,
  BarChart3,
  Users,
  Mail,
} from "lucide-react";
import api from "../../lib/api";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import InviteMemberModal from "./InviteMemberModal";
import { useState } from "react";

export default function GroupDetailPage() {
  const { id } = useParams();
  const [showInvite, setShowInvite] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: async () => {
      const res = await api.get(`/groups/${id}`);
      return res.data.data.group;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) return null;

  const group = data;

  const navLinks = [
    { to: `/groups/${id}/contributions`, icon: Wallet, label: "Contributions" },
    { to: `/groups/${id}/payouts`, icon: CreditCard, label: "Payouts" },
    { to: `/groups/${id}/meetings`, icon: CalendarDays, label: "Meetings" },
    { to: `/groups/${id}/analytics`, icon: BarChart3, label: "Analytics" },
  ];

  // The API stores these as constants; nobody should have to read
  // "ROTATING" to understand when they get paid.
  const payoutOrderLabels = {
    ROTATING: "Rotating payout order",
    RANDOM: "Random payout order",
    FIXED: "Fixed payout order",
  };

  const roleLabel = group.myRole
    ? group.myRole === "MEMBER"
      ? "You are a member"
      : `You are the ${group.myRole.toLowerCase()}`
    : null;

  return (
    <div className="space-y-6">
      {/* Group header */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary-50 font-display text-2xl font-semibold text-primary-700 ring-1 ring-primary-100">
            {group.name?.charAt(0).toUpperCase() || "S"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="font-display text-xl font-semibold text-stone-900">
                {group.name}
              </h2>
              {roleLabel && (
                <span className="text-xs font-medium text-stone-500">
                  {roleLabel}
                </span>
              )}
            </div>
            {group.description && (
              <p className="mt-1 text-sm text-stone-600">{group.description}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="badge badge-blue">
                R{parseFloat(group.contributionAmount).toLocaleString("en-ZA")}{" "}
                / {group.contributionFrequency.toLowerCase()}
              </span>
              <span className="badge badge-gray">
                {payoutOrderLabels[group.payoutOrder] || group.payoutOrder}
              </span>
              <span className="badge badge-gray">
                {group.members?.length || 0} / {group.maxMembers} members
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="card flex cursor-pointer flex-col items-center gap-2 py-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-700">
              <Icon size={20} strokeWidth={1.9} />
            </div>
            <span className="text-sm font-medium text-stone-700">{label}</span>
          </Link>
        ))}
      </div>

      {/* Members */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-stone-900">
            <Users size={18} className="text-stone-400" />
            Members ({group.members?.length || 0})
          </h3>
          <button
            onClick={() => setShowInvite(true)}
            className="btn-secondary flex items-center gap-2 py-1.5 text-xs"
          >
            <Mail size={14} />
            Invite
          </button>
        </div>

        <div className="space-y-1">
          {group.members?.map((member) => (
            <div
              key={member.user.id}
              className="flex items-center gap-3 border-b border-stone-100 py-2.5 last:border-0"
            >
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-50 text-sm font-semibold text-primary-700">
                {member.user.fullName?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-900">
                  {member.user.fullName}
                </p>
                <p className="truncate text-xs text-stone-500">
                  {member.user.email}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {member.payoutPosition && (
                  <span className="text-xs tabular-nums text-stone-500">
                    pays out #{member.payoutPosition}
                  </span>
                )}
                <Badge label={member.role} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <InviteMemberModal groupId={id} onClose={() => setShowInvite(false)} />
      )}
    </div>
  );
}
