export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
  trend,
}) {
  const colors = {
    blue: "bg-blue-50   text-blue-600",
    green: "bg-green-50  text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50    text-red-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <p
              className={`text-xs mt-1 font-medium ${
                trend >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% this month
            </p>
          )}
        </div>
        {icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center
                          justify-center text-xl ${colors[color]}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
