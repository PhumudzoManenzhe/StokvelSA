import { ArrowRight, BarChart3, CalendarDays, ChevronDown, Download, Landmark, LockKeyhole, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const features = [
  ['Real-time analytics', 'See compliance rates and payout history at a glance.', BarChart3],
  ['Meeting management', 'Schedule gatherings and keep important minutes together.', CalendarDays],
  ['Smart reminders', 'Gentle prompts help every member stay on track.', Sparkles],
  ['Savings projections', 'Explore how your savings can grow with SA rates.', Landmark],
  ['Export reports', 'Keep polished PDF and CSV records for your group.', Download],
  ['Secure by design', 'Trusted authentication and protected financial records.', LockKeyhole],
];

export default function LandingPage() {
  const navigate = useNavigate();
  const scrollToHow = () => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });

  return <div className="min-h-screen overflow-x-hidden bg-stone-50 text-stone-900">
    <nav className="sticky top-0 z-20 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-primary-700"><span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600 text-sm text-white">S</span>StokvelSA</Link>
        <div className="flex items-center gap-3"><Link className="px-3 py-2 text-sm font-medium text-stone-600 hover:text-primary-700" to="/login">Sign in</Link><Link className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700" to="/register">Get started</Link></div>
      </div>
    </nav>

    <main>
      <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-24">
        <div className="animate-fade-in"><p className="mb-4 font-medium text-primary-700">Built for community savings</p><h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-stone-900 sm:text-6xl">Your stokvel,<br /><span className="text-primary-600">digitalised.</span></h1><p className="mt-6 max-w-lg text-lg leading-8 text-stone-600">Join South Africans saving together, tracking contributions, and building wealth — all in one place.</p><div className="mt-8 flex flex-wrap gap-3"><Link className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:-translate-y-0.5 hover:bg-primary-700" to="/register">Start your stokvel <ArrowRight size={17} /></Link><button onClick={scrollToHow} className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-primary-300 hover:text-primary-700">See how it works <ChevronDown size={17} /></button></div></div>
        <div className="relative animate-fade-in"><img className="h-[390px] w-full rounded-3xl object-cover shadow-xl shadow-stone-900/10 sm:h-[460px]" src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800" alt="A diverse group of people smiling together" /><div className="absolute -bottom-6 -left-3 rounded-2xl border border-amber-100 bg-white p-5 shadow-xl sm:-left-8"><p className="text-xs font-medium uppercase tracking-wide text-stone-500">Growing together</p><p className="mt-1 text-2xl font-bold text-stone-900">R 1.2M</p><p className="text-sm text-emerald-600">saved by our community</p></div></div>
      </section>

      <section id="how-it-works" className="border-y border-stone-200 bg-white py-20"><div className="mx-auto max-w-6xl px-5 sm:px-8"><p className="text-sm font-semibold text-primary-700">Simple by design</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Savings, made more together.</h2><div className="mt-10 grid gap-8 md:grid-cols-3">{[['01','Create your stokvel','Set up your group, define contribution amounts, and invite members in minutes.'],['02','Track contributions','Every member’s contributions are easy to see. Treasurers confirm payments with one click.'],['03','Receive your payout','When it is your turn, receive your full payout. Transparent, fair, and on time.']].map(([number,title,text]) => <article key={number} className="rounded-2xl border border-stone-200 p-6"><span className="text-sm font-bold text-amber-600">{number}</span><h3 className="mt-5 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-stone-600">{text}</p></article>)}</div></div></section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8"><div className="max-w-xl"><p className="text-sm font-semibold text-primary-700">Everything in its place</p><h2 className="mt-2 text-3xl font-bold">Made for the way stokvels work.</h2></div><div className="mt-10 grid gap-4 sm:grid-cols-2">{features.map(([title,text,Icon]) => <article key={title} className="rounded-2xl border border-stone-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-stone-900/5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-600"><Icon size={19}/></span><h3 className="mt-5 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-stone-600">{text}</p></article>)}</div></section>

      <section className="bg-stone-900 py-16 text-stone-50"><div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-8 md:grid-cols-[1fr_auto] md:items-center"><div><p className="text-sm font-semibold text-amber-400">Live South African Interest Rates</p><h2 className="mt-2 text-3xl font-bold">Savings decisions with local context.</h2><p className="mt-3 max-w-xl text-stone-300">Your savings projections use real South African Reserve Bank data — not estimates.</p></div><div className="flex gap-3"><div className="rounded-2xl border border-stone-700 p-5"><p className="text-xs text-stone-400">Prime rate</p><p className="mt-1 text-2xl font-bold">11.75%</p></div><div className="rounded-2xl border border-stone-700 p-5"><p className="text-xs text-stone-400">Repo rate</p><p className="mt-1 text-2xl font-bold">8.25%</p></div></div></div></section>

      <section className="bg-amber-100 py-20"><div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 md:grid-cols-2 md:items-center"><div><p className="text-sm font-semibold text-amber-800">Our shared foundation</p><blockquote className="mt-3 text-3xl font-bold leading-tight text-stone-900">“Ubuntu ngumuntu ngabantu”</blockquote><p className="mt-2 text-lg text-stone-700">A person is a person through other people.</p><p className="mt-5 leading-7 text-stone-700">StokvelSA is built on the same philosophy that has powered stokvels for generations.</p><button onClick={() => navigate('/register')} className="mt-7 rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800">Build wealth together</button></div><img className="h-72 w-full rounded-3xl object-cover" src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600" alt="Friends gathering as a community" /></div></section>
    </main>
    <footer className="bg-white py-10"><div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-8"><div><span className="font-bold text-primary-700">StokvelSA</span><span className="ml-3">Saving together, growing together.</span></div><div className="flex gap-5"><a href="#how-it-works">How it works</a><Link to="/login">Sign in</Link><Link to="/register">Get started</Link></div><p>© 2026 StokvelSA. Built with love in South Africa.</p></div></footer>
  </div>;
}
