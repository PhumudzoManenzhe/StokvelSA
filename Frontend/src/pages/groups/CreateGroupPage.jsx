import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../lib/api";

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    description: "",
    contributionAmount: "",
    contributionFrequency: "MONTHLY",
    payoutOrder: "FIXED",
    maxMembers: 20,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => api.post("/groups", data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Stokvel created successfully!");
      navigate(`/groups/${res.data.data.group.id}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Failed to create stokvel");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate({
      ...form,
      contributionAmount: parseFloat(form.contributionAmount),
      maxMembers: parseInt(form.maxMembers),
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Create a Stokvel</h2>
        <p className="text-sm text-gray-500 mt-1">
          Set up your group and invite members to join
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="label">Stokvel name *</label>
            <input
              name="name"
              required
              className="input"
              placeholder="e.g. Ubuntu Savings Group"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea
              name="description"
              rows={3}
              className="input resize-none"
              placeholder="What is this stokvel for?"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          {/* Contribution amount */}
          <div>
            <label className="label">Monthly contribution (R) *</label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2
                               text-gray-400 font-medium"
              >
                R
              </span>
              <input
                name="contributionAmount"
                type="number"
                required
                min="1"
                step="0.01"
                className="input pl-8"
                placeholder="500.00"
                value={form.contributionAmount}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Frequency + Payout order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Contribution frequency</label>
              <select
                name="contributionFrequency"
                className="input"
                value={form.contributionFrequency}
                onChange={handleChange}
              >
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
              </select>
            </div>

            <div>
              <label className="label">Payout order</label>
              <select
                name="payoutOrder"
                className="input"
                value={form.payoutOrder}
                onChange={handleChange}
              >
                <option value="FIXED">Fixed order</option>
                <option value="ROTATING">Rotating</option>
                <option value="RANDOM">Random draw</option>
              </select>
            </div>
          </div>

          {/* Max members */}
          <div>
            <label className="label">Maximum members</label>
            <input
              name="maxMembers"
              type="number"
              min="2"
              max="100"
              className="input"
              value={form.maxMembers}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-400 mt-1">
              How many members can join this stokvel (max 100)
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/groups")}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary flex-1"
            >
              {isPending ? "Creating..." : "Create Stokvel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
