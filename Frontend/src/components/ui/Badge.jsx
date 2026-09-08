const variants = {
  CONFIRMED: "badge-green",
  COMPLETED: "badge-green",
  SCHEDULED: "badge-blue",
  PENDING: "badge-yellow",
  MISSED: "badge-red",
  FAILED: "badge-red",
  CANCELLED: "badge-red",
  PROCESSING: "badge-yellow",
  ADMIN: "badge-purple",
  TREASURER: "badge-blue",
  MEMBER: "badge-gray",
};

export default function Badge({ label }) {
  const cls = variants[label] || "badge-gray";
  return <span className={cls}>{label}</span>;
}
