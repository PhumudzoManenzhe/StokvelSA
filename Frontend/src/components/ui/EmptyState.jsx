/**
 * The empty state is the first thing a new member sees, so it should look
 * deliberate rather than like a page that failed to load.
 *
 * `icon` accepts a Lucide component or a short emoji string; a component is
 * preferred, because emoji render differently on every device.
 */
export default function EmptyState({ icon: Icon, title, description, action }) {
  const isEmoji = typeof Icon === "string";

  return (
    <div className="mx-auto max-w-sm px-4 py-12 text-center">
      {Icon && (
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-50 text-primary-700 ring-1 ring-primary-100">
          {isEmoji ? (
            <span className="text-2xl">{Icon}</span>
          ) : (
            <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
          )}
        </div>
      )}

      <h3 className="mt-5 font-display text-xl font-semibold text-stone-900">
        {title}
      </h3>

      {description && (
        <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
