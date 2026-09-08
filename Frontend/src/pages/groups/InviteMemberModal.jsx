import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import api from "../../lib/api";

export default function InviteMemberModal({ groupId, onClose }) {
  const [form, setForm] = useState({ email: "", role: "MEMBER" });
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => api.post(`/groups/${groupId}/invite`, data),
    onSuccess: (res) => {
      const code = res.data.data.code;
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      toast.success(`Invitation sent! Code: ${code}`);
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Failed to send invitation");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(form);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center
                    justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Invite a Member</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Email address</label>
            <input
              type="email"
              required
              className="input"
              placeholder="member@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="label">Role</label>
            <select
              className="input"
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            >
              <option value="MEMBER">Member</option>
              <option value="TREASURER">Treasurer</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Treasurer can confirm contributions and schedule payouts
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary flex-1"
            >
              {isPending ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
