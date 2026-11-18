import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  Landmark,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Wordmark } from "../components/ui/BrandMark";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#kinds", label: "Kinds of stokvel" },
  { href: "#faq", label: "Questions" },
];

const STEPS = [
  {
    number: "01",
    title: "Open the book",
    body: "Give the stokvel a name, a contribution amount and a rhythm — weekly, monthly or quarterly. It takes about two minutes.",
  },
  {
    number: "02",
    title: "Call the circle in",
    body: "Send an invitation link. Each person joins with their own phone and sees the same record as everyone else.",
  },
  {
    number: "03",
    title: "Keep it honest",
    body: "Contributions get confirmed or flagged, payouts are scheduled, and the minutes stay with the group instead of in someone's bag.",
  },
];

const KINDS = [
  {
    name: "The payout rotation",
    local: "umgalelo",
    body: "One member takes the whole pot each month, in an order the group agreed on before anyone paid in.",
  },
  {
    name: "The grocery stokvel",
    local: "umgqibelo",
    body: "Everyone buys in through the year so that December is a shop, not a scramble.",
  },
  {
    name: "The burial society",
    local: "umhlahlo",
    body: "The oldest form of the idea. Members pay monthly so that a family is held up when the worst happens.",
  },
  {
    name: "The investment club",
    local: "ukutshala",
    body: "Nothing is paid out on rotation. The money is put away together and grows there.",
  },
];

const FEATURES = [
  {
    icon: Users,
    title: "Roles that mean something",
    body: "Administrator, treasurer or member. Only the people who should confirm a payment are able to.",
  },
  {
    icon: Wallet,
    title: "Contributions, month by month",
    body: "Open a period, confirm what has come in, and flag what has not. Nobody has to remember it in their head.",
  },
  {
    icon: TrendingUp,
    title: "A payout order everyone agreed to",
    body: "Record whose turn it is and when the money moves, so the order is not relitigated every month.",
  },
  {
    icon: CalendarDays,
    title: "Meetings and minutes",
    body: "Schedule the gathering, keep the agenda, and cancel it properly when plans change.",
  },
  {
    icon: BarChart3,
    title: "Reports you can hand over",
    body: "Compliance and payout reports, ready to print as a PDF when someone asks for the books.",
  },
  {
    icon: Landmark,
    title: "South African rates",
    body: "Prime and repo rates read from the Reserve Bank and cached, so projections use this country's numbers.",
  },
];

const PROMISES = [
  {
    title: "It does not hold your money",
    body: "StokvelSA is the record of what the group agreed and what has been paid. Contributions move between members, not through us.",
  },
  {
    title: "It does not decide your payouts",
    body: "The group sets the order. The app keeps it visible so that no one has to argue from memory.",
  },
  {
    title: "It does not reach outside the group",
    body: "You see the stokvels you belong to and the people in them. Nothing else follows you around.",
  },
];

const FAQS = [
  {
    question: "Does StokvelSA keep our money?",
    answer:
      "No. It keeps the record. Deposits are made between members the way they always were — into the treasurer's account, or into a shared one — and the app tracks who has paid, who has not, and whose turn it is.",
  },
  {
    question: "What does it cost?",
    answer:
      "Nothing. StokvelSA is a working demonstration project, so there is no billing, no subscription and no card to enter.",
  },
  {
    question: "Do all our members need a smartphone?",
    answer:
      "One phone per group is enough to keep the book. A treasurer can record what came in on someone else's behalf, and that member will see their own record the next time they look.",
  },
  {
    question: "Is the payment integration live?",
    answer:
      "No. Payments run against the PayFast sandbox, which is a test environment. No real money moves through this application.",
  },
  {
    question: "What happens to our records?",
    answer:
      "They stay with your group's account for as long as it exists. Deleting your account removes your profile; the group's history belongs to the group.",
  },
];

/**
 * The landing page is public, so it reads rates directly instead of going
 * through the authenticated client — a visitor should never be redirected to a
 * login screen because a marketing page made a request.
 */
function usePublicRates() {
  return useQuery({
    queryKey: ["rates", "public"],
    queryFn: async () => {
      const baseUrl = import.meta.env.VITE_API_URL;
      if (!baseUrl) throw new Error("No API URL configured");

      const res = await axios.get(`${baseUrl}/rates`, { timeout: 8000 });
      return res.data?.data?.rates ?? null;
    },
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: rates, isError: ratesFailed } = usePublicRates();

  // The API falls back to a hardcoded pair when the Reserve Bank cannot be
  // reached. Showing those as though they were just fetched would be a lie.
  const ratesAreReal = rates && !rates.fallback;

  return (
    <div className="min-h-screen overflow-x-hidden bg-stone-50 text-stone-900">
      <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-stone-50/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Wordmark />

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-200/50 hover:text-stone-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              to="/login"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-stone-700 transition hover:text-primary-700"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
            >
              Start a stokvel
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg p-2 text-stone-600 md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-stone-200 bg-stone-50 px-5 pb-5 pt-3 md:hidden">
            <nav className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-2 py-3 text-sm font-medium text-stone-700"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-3 grid gap-2">
              <Link
                to="/login"
                className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-center text-sm font-semibold text-stone-700"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-primary-600 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Start a stokvel
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14 lg:py-20">
          <div className="animate-fade-in-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
              <MapPin size={13} />
              Made for South African stokvels
            </p>

            <h1 className="mt-5 max-w-xl text-pretty font-display text-4xl font-semibold leading-[1.08] tracking-tight text-stone-900 sm:text-5xl lg:text-[3.4rem]">
              The stokvel book, in everyone&rsquo;s hands.
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-8 text-stone-600">
              Contributions, payouts and meeting minutes used to live in one
              member&rsquo;s exercise book. StokvelSA keeps that same record, and
              lets the whole circle read it.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-primary-700"
              >
                Start a stokvel
                <ArrowRight size={17} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-primary-300 hover:text-primary-700"
              >
                See how it works
                <ChevronDown size={17} />
              </a>
            </div>

            <p className="mt-5 flex items-center gap-2 text-sm text-stone-500">
              <ShieldCheck size={15} className="text-emerald-600" />
              No card needed. Members join from a link.
            </p>
          </div>

          <div className="relative animate-fade-in">
            <img
              src="/images/stokvel-circle.jpg"
              alt="A multigenerational South African stokvel sitting in a circle at home, passing a notebook and an envelope between them"
              width={1600}
              height={1067}
              fetchPriority="high"
              decoding="async"
              className="h-[360px] w-full rounded-[1.75rem] object-cover shadow-soft sm:h-[440px] lg:h-[500px]"
            />

            <div className="absolute -bottom-6 left-4 right-4 rounded-2xl border border-stone-200/80 bg-white/95 p-4 shadow-soft backdrop-blur sm:left-6 sm:right-auto sm:max-w-xs">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                  <Check size={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    Confirmed by the treasurer
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-stone-500">
                    Every member sees the same entry, at the same time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="scroll-mt-20 border-y border-stone-200 bg-white py-20"
        >
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <p className="text-sm font-semibold text-primary-700">
              Three things, then you are running
            </p>
            <h2 className="mt-2 max-w-2xl text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Nothing to learn that you do not already do.
            </h2>

            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-stone-200 bg-stone-200 md:grid-cols-3">
              {STEPS.map((step) => (
                <article key={step.number} className="bg-white p-7">
                  <span className="font-display text-sm font-semibold text-amber-600">
                    {step.number}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-stone-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {step.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Kinds of stokvel */}
        <section id="kinds" className="scroll-mt-20 py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-primary-700">
                One idea, many shapes
              </p>
              <h2 className="mt-2 text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Which one is yours?
              </h2>
              <p className="mt-4 leading-7 text-stone-600">
                A stokvel is not one thing. The structure is chosen by the people
                in it, and it usually changes over the years.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {KINDS.map((kind) => (
                <article
                  key={kind.name}
                  className="rounded-2xl border border-stone-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-soft"
                >
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <h3 className="font-semibold text-stone-900">{kind.name}</h3>
                    <span className="text-sm italic text-primary-700">
                      {kind.local}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {kind.body}
                  </p>
                </article>
              ))}
            </div>

            <p className="mt-6 text-sm text-stone-500">
              Whichever shape you run, the record is the same: who paid, who has
              not, and whose turn it is.
            </p>
          </div>
        </section>

        {/* Ubuntu */}
        <section className="bg-stone-900 py-0 text-stone-50">
          <div className="mx-auto grid max-w-6xl items-center gap-0 md:grid-cols-2">
            <img
              src="/images/ubuntu-stoep.jpg"
              alt="A grandmother in a patterned doek laughing with a younger woman on a sunlit stoep"
              width={900}
              height={1125}
              loading="lazy"
              decoding="async"
              className="h-72 w-full object-cover md:h-full md:min-h-[420px]"
            />
            <div className="px-5 py-14 sm:px-8 md:py-20 md:pl-12">
              <p className="text-sm font-semibold text-amber-400">
                Why this works at all
              </p>
              <blockquote className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl">
                Motho ke motho ka batho.
              </blockquote>
              <p className="mt-3 text-lg text-amber-100">
                A person is a person through other people.
              </p>
              <p className="mt-6 max-w-md leading-7 text-stone-300">
                A stokvel is the oldest fintech in this country, and it works
                because everyone can see the same book and trusts the same
                people. StokvelSA does not replace that trust. It just stops the
                book from going missing.
              </p>
              <Link
                to="/register"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-stone-900 transition hover:bg-amber-50"
              >
                Start your own
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-primary-700">
                What is inside
              </p>
              <h2 className="mt-2 text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Made for the way stokvels actually run.
              </h2>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-stone-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-600">
                    <Icon size={19} />
                  </span>
                  <h3 className="mt-4 font-semibold text-stone-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Honesty + rates */}
        <section className="border-y border-stone-200 bg-white py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
              <div>
                <p className="text-sm font-semibold text-primary-700">
                  Said plainly
                </p>
                <h2 className="mt-2 text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  What this does — and what it deliberately leaves to you.
                </h2>
                <p className="mt-4 leading-7 text-stone-600">
                  Stokvels work because of consent and trust, not because of an
                  app. So here is exactly where StokvelSA stops.
                </p>

                <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5">
                  <p className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                    <Landmark size={16} className="text-primary-600" />
                    South African Reserve Bank rates
                  </p>

                  {ratesAreReal ? (
                    <>
                      <div className="mt-3 flex gap-6">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-stone-500">
                            Prime
                          </p>
                          <p className="font-display text-2xl font-semibold text-stone-900">
                            {rates.primeRate}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-stone-500">
                            Repo
                          </p>
                          <p className="font-display text-2xl font-semibold text-stone-900">
                            {rates.repoRate}%
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-stone-500">
                        Read from the Reserve Bank and cached for 24 hours. Used
                        when a member explores how contributions could grow.
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-xs leading-5 text-stone-500">
                      {ratesFailed
                        ? "The rate service could not be reached just now. Inside the app these figures appear once they are available."
                        : "Loading the latest figures from the Reserve Bank…"}
                    </p>
                  )}
                </div>
              </div>

              <ul className="space-y-3">
                {PROMISES.map((promise) => (
                  <li
                    key={promise.title}
                    className="rounded-2xl border border-stone-200 p-6"
                  >
                    <h3 className="font-semibold text-stone-900">
                      {promise.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      {promise.body}
                    </p>
                  </li>
                ))}
                <li className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-5 text-sm text-emerald-900">
                  <LockKeyhole size={17} className="shrink-0" />
                  Sign-in and passwords are handled by Supabase. StokvelSA never
                  stores a password of yours.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 py-20">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <p className="text-sm font-semibold text-primary-700">
              Before you ask
            </p>
            <h2 className="mt-2 text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Questions members actually ask.
            </h2>

            <div className="mt-10 divide-y divide-stone-200 border-y border-stone-200">
              {FAQS.map((faq) => (
                <details key={faq.question} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-semibold text-stone-900 transition hover:text-primary-700 [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <ChevronDown
                      size={18}
                      className="shrink-0 text-stone-400 transition group-open:rotate-180"
                    />
                  </summary>
                  <p className="pb-5 pr-8 text-sm leading-7 text-stone-600">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Closing call */}
        <section className="pb-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="overflow-hidden rounded-3xl bg-primary-600 px-6 py-14 text-center text-white sm:px-12">
              <Sparkles size={22} className="mx-auto text-amber-300" />
              <h2 className="mx-auto mt-4 max-w-xl text-balance font-display text-3xl font-semibold leading-tight sm:text-4xl">
                Bring your circle in.
              </h2>
              <p className="mx-auto mt-4 max-w-md leading-7 text-primary-100">
                Open your stokvel, send one link, and let the book look after
                itself this month.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
                >
                  Create your stokvel
                  <ArrowRight size={17} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  I have an account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200 bg-white py-12">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Wordmark />
              <p className="mt-4 max-w-xs text-sm leading-6 text-stone-500">
                A shared record for South African savings groups. Saving
                together, growing together.
              </p>
              <p className="mt-4 flex items-center gap-2 text-xs text-stone-400">
                <Mail size={13} />
                Payments run against the PayFast sandbox. No real money moves.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-stone-900">Product</p>
              <ul className="mt-3 space-y-2 text-sm text-stone-500">
                <li>
                  <a className="hover:text-primary-700" href="#how-it-works">
                    How it works
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary-700" href="#kinds">
                    Kinds of stokvel
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary-700" href="#faq">
                    Questions
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary-700" href="#features">
                    Features
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-stone-900">Account</p>
              <ul className="mt-3 space-y-2 text-sm text-stone-500">
                <li>
                  <Link className="hover:text-primary-700" to="/login">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary-700" to="/register">
                    Create an account
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-primary-700"
                    to="/forgot-password"
                  >
                    Reset your password
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-stone-200 pt-6 text-xs text-stone-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} StokvelSA. Built in South Africa.</p>
            <p className="flex items-center gap-1.5">
              <ShieldCheck size={13} />
              A demonstration project, not a licensed financial service.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
