import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Wallet,
  CreditCard,
  CalendarDays,
  BarChart3,
  Users,
  Plus,
  Mail,
} from "lucide-react";
import api from "../../lib/api";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import InviteMemberModal from "../../components/groups/InviteMemberModal";
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

  return (
    <div className="space-y-6">
      {/* Group header */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center
                          justify-center text-3xl shrink-0"
          >
            🏦
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900">{group.name}</h2>
            {group.description && (
              <p className="text-gray-500 text-sm mt-1">{group.description}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="badge badge-blue">
                R{parseFloat(group.contributionAmount).toLocaleString("en-ZA")}{" "}
                / {group.contributionFrequency.toLowerCase()}
              </span>
              <span className="badge badge-gray">
                {group.payoutOrder} order
              </span>
              <span className="badge badge-gray">
                {group.members?.length || 0} / {group.maxMembers} members
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="card flex flex-col items-center gap-2 py-4
                       hover:shadow-md transition-all hover:-translate-y-0.5
                       text-center cursor-pointer"
          >
            <div
              className="w-10 h-10 rounded-xl bg-primary-50 flex items-center
                            justify-center text-primary-600"
            >
              <Icon size={20} />
            </div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </Link>
        ))}
      </div>

      {/* Members */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users size={18} />
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

        <div className="space-y-3">
          {group.members?.map((member, index) => (
            <div
              key={member.user.id}
              className="flex items-center gap-3 py-2 border-b border-gray-50
                         last:border-0"
            >
              <div
                className="w-8 h-8 rounded-full bg-primary-100 flex items-center
                              justify-center text-primary-700 text-sm font-semibold
                              shrink-0"
              >
                {member.user.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {member.user.fullName}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {member.user.email}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {member.payoutPosition && (
                  <span className="text-xs text-gray-400">#{index + 1}</span>
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
