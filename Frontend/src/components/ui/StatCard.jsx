export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = "primary",
  trend,
}) {
  const colors = {
    primary: "bg-primary-50  text-primary-700",
    blue: "bg-sky-50      text-sky-700",
    green: "bg-emerald-50  text-emerald-700",
    yellow: "bg-amber-50    text-amber-700",
    red: "bg-red-50      text-red-700",
    purple: "bg-violet-50   text-violet-700",
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-stone-500">{title}</p>
          <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-stone-900">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-stone-500">{subtitle}</p>
          )}
          {trend !== undefined && (
            <p
              className={`mt-1 text-xs font-medium ${
                trend >= 0 ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {trend >= 0 ? "up" : "down"} {Math.abs(trend)}% this month
            </p>
          )}
        </div>
        {icon && (
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
              colors[color] || colors.primary
            }`}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
