import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../lib/api";

const PERIOD_WORD = {
  WEEKLY: "week",
  MONTHLY: "month",
  QUARTERLY: "quarter",
};

const PAYOUT_HELP = {
  FIXED: "Everyone is paid in the order they joined.",
  ROTATING: "The turn to be paid moves to the next member each round.",
  RANDOM: "A name is drawn each round, so nobody can plan ahead.",
};

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
      toast.success(`${res.data.data.group.name} is ready — now invite people`);
      navigate(`/groups/${res.data.data.group.id}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Could not create the stokvel");
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    mutate({
      ...form,
      contributionAmount: parseFloat(form.contributionAmount),
      maxMembers: parseInt(form.maxMembers, 10),
    });
  };

  const period = PERIOD_WORD[form.contributionFrequency];
  const amount = parseFloat(form.contributionAmount);
  const size = parseInt(form.maxMembers, 10);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h2 className="font-display text-xl font-semibold text-stone-900">
          Create a stokvel
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Set the rules now. You can change them afterwards, but everyone will
          need to agree.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label" htmlFor="name">
              Stokvel name
            </label>
            <input
              id="name"
              name="name"
              required
              className="input"
              placeholder="e.g. Masibambane Savings Club"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label" htmlFor="description">
              What is it for?
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="input resize-none"
              placeholder="Groceries in December, school fees in January, a burial fund…"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label" htmlFor="contributionAmount">
              Contribution per {period}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-stone-400">
                R
              </span>
              <input
                id="contributionAmount"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="contributionFrequency">
                How often
              </label>
              <select
                id="contributionFrequency"
                name="contributionFrequency"
                className="input"
                value={form.contributionFrequency}
                onChange={handleChange}
              >
                <option value="WEEKLY">Every week</option>
                <option value="MONTHLY">Every month</option>
                <option value="QUARTERLY">Every quarter</option>
              </select>
            </div>

            <div>
              <label className="label" htmlFor="payoutOrder">
                Who gets paid first
              </label>
              <select
                id="payoutOrder"
                name="payoutOrder"
                className="input"
                value={form.payoutOrder}
                onChange={handleChange}
              >
                <option value="FIXED">In the order people joined</option>
                <option value="ROTATING">Takes turns</option>
                <option value="RANDOM">Drawn at random</option>
              </select>
            </div>
          </div>

          <p className="-mt-2 text-xs leading-5 text-stone-500">
            {PAYOUT_HELP[form.payoutOrder]}
          </p>

          <div>
            <label className="label" htmlFor="maxMembers">
              Most members allowed
            </label>
            <input
              id="maxMembers"
              name="maxMembers"
              type="number"
              min="2"
              max="100"
              className="input"
              value={form.maxMembers}
              onChange={handleChange}
            />
            <p className="mt-1 text-xs text-stone-500">
              Between 2 and 100. A full round has to fit inside a year for most
              groups to feel fair.
            </p>
          </div>

          {/* Stokvels think in pots, not in line items, so show the arithmetic
              back rather than making the treasurer do it in their head. */}
          {amount > 0 && size > 1 && (
            <div className="rounded-xl bg-primary-50/60 p-4 ring-1 ring-primary-100">
              <p className="text-sm leading-6 text-stone-700">
                If all {size} members pay, the pot is{" "}
                <strong className="font-semibold text-primary-800">
                  R{(amount * size).toLocaleString("en-ZA")}
                </strong>{" "}
                every {period}, and each member receives it once before the
                round repeats.
              </p>
            </div>
          )}

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
              {isPending ? "Creating…" : "Create stokvel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
