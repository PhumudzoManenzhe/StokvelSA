import { Check, ShieldCheck } from "lucide-react";
import { Wordmark } from "../ui/BrandMark";

const POINTS = [
  "Keep every contribution visible",
  "Stay close to your community",
  "Plan every payout with confidence",
];

/**
 * The two-column shell shared by every sign-in screen. The photograph is part
 * of the argument rather than decoration: these are the people the product is
 * for, so they hold the whole left side on a wide screen.
 */
export default function AuthLayout({ children, image, imageAlt, greeting, title }) {
  return (
    <main className="min-h-screen bg-stone-50 lg:grid lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden lg:block">
        <img
          src={image}
          alt={imageAlt || ""}
          className="absolute inset-0 h-full w-full object-cover"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/92 via-stone-950/65 to-stone-900/35" />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Wordmark tone="light" />

          <div>
            <p className="font-display text-lg font-medium text-amber-300">
              {greeting}
            </p>
            <h1 className="mt-3 max-w-md text-balance font-display text-4xl font-semibold leading-[1.1]">
              {title}
            </h1>

            <ul className="mt-8 space-y-4 text-stone-100">
              {POINTS.map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/15">
                    <Check size={14} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <p className="flex items-center gap-2 text-sm text-stone-300">
            <ShieldCheck size={16} />
            Designed for trusted community savings
          </p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Wordmark className="mb-10 lg:hidden" />
          {children}
        </div>
      </section>
    </main>
  );
}
