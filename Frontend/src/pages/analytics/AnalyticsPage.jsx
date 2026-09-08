import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import api from "../../lib/api";
import Spinner from "../../components/ui/Spinner";
import { Download } from "lucide-react";

const COLORS = ["#4F46E5", "#16a34a", "#d97706", "#dc2626"];

export default function AnalyticsPage() {
  const { id } = useParams();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["analytics", id, "dashboard"],
    queryFn: async () => {
      const res = await api.get(`/groups/${id}/analytics/dashboard`);
      return res.data.data.report;
    },
  });

  const { data: compliance } = useQuery({
    queryKey: ["analytics", id, "compliance"],
    queryFn: async () => {
      const res = await api.get(`/groups/${id}/analytics/compliance`);
      return res.data.data.report;
    },
  });

  const handleExport = async (type, format) => {
    const res = await api.get(
      `/groups/${id}/analytics/${type}/export/${format}`,
      { responseType: "blob" },
    );

    const url = URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${type}-${Date.now()}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  if (!dashboard) return null;

  // Pie chart data for current period
  const pieData = [
    { name: "Confirmed", value: dashboard.currentPeriodStats.confirmed },
    { name: "Pending", value: dashboard.currentPeriodStats.pending },
    { name: "Missed", value: dashboard.currentPeriodStats.missed },
  ].filter((d) => d.value > 0);

  // Bar chart data from compliance
  const barData =
    compliance?.memberCompliance?.map((mc) => ({
      name: mc.member.fullName.split(" ")[0],
      compliance: mc.stats.complianceRate,
      confirmed: mc.stats.confirmed,
      missed: mc.stats.missed,
    })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Analytics</h2>

        {/* Export buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleExport("compliance", "csv")}
            className="btn-secondary flex items-center gap-2 py-1.5 text-xs"
          >
            <Download size={14} />
            CSV
          </button>
          <button
            onClick={() => handleExport("compliance", "pdf")}
            className="btn-secondary flex items-center gap-2 py-1.5 text-xs"
          >
            <Download size={14} />
            PDF
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-600">
            R
            {parseFloat(dashboard.allTime.totalCollected).toLocaleString(
              "en-ZA",
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total Collected</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">
            R
            {parseFloat(dashboard.allTime.totalPaidOut).toLocaleString("en-ZA")}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total Paid Out</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-600">
            {dashboard.memberCount}
          </p>
          <p className="text-xs text-gray-500 mt-1">Members</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-purple-600">
            {dashboard.upcomingMeetings}
          </p>
          <p className="text-xs text-gray-500 mt-1">Upcoming Meetings</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Compliance bar chart */}
        {barData.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">
              Member Compliance Rate
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit="%" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar
                  dataKey="compliance"
                  fill="#4F46E5"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Current period pie chart */}
        {pieData.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">
              Current Period — {dashboard.currentPeriod}
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
