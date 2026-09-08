import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { User, Phone, Mail } from "lucide-react";
import api from "../../lib/api";
import useAuthStore from "../../stores/authStore";

export default function ProfilePage() {
  const { profile, fetchProfile, logout } = useAuthStore();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    fullName: profile?.fullName || "",
    phone: profile?.phone || "",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => api.patch("/auth/me", data),
    onSuccess: async () => {
      await fetchProfile();
      toast.success("Profile updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Update failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(form);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Profile</h2>

      {/* Avatar */}
      <div className="card flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center
                        justify-center text-primary-700 text-2xl font-bold"
        >
          {profile?.fullName?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{profile?.fullName}</p>
          <p className="text-sm text-gray-500">{profile?.email}</p>
          <p className="text-xs text-gray-400 mt-1">
            Member since{" "}
            {new Date(profile?.createdAt).toLocaleDateString("en-ZA")}
          </p>
        </div>
      </div>

      {/* Edit form */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Edit Profile</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2
                                         text-gray-400"
              />
              <input
                className="input pl-9"
                value={form.fullName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, fullName: e.target.value }))
                }
              />
            </div>
          </div>

          <div>
            <label className="label">Email address</label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2
                                         text-gray-400"
              />
              <input className="input pl-9" value={profile?.email} disabled />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Email cannot be changed here
            </p>
          </div>

          <div>
            <label className="label">Phone number</label>
            <div className="relative">
              <Phone
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2
                                          text-gray-400"
              />
              <input
                className="input pl-9"
                placeholder="+27821234567"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="card border-red-100">
        <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-500 mb-4">
          Once you delete your account, there is no going back.
        </p>
        <button className="btn-danger">Delete Account</button>
      </div>
    </div>
  );
}
