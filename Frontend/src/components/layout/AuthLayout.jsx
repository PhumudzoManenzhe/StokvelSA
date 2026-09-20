import { Check, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AuthLayout({ children, image, greeting, title }) {
  return <main className="min-h-screen bg-stone-50 lg:grid lg:grid-cols-2">
    <section className="relative hidden overflow-hidden lg:block"><img src={image} alt="A stokvel community meeting" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-stone-900/70" /><div className="relative flex h-full max-w-xl flex-col justify-between p-12 text-white"><Link to="/" className="flex items-center gap-2 text-lg font-bold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-sm text-primary-700">S</span>StokvelSA</Link><div><p className="text-lg font-medium text-amber-300">{greeting}</p><h1 className="mt-3 text-4xl font-bold leading-tight">{title}</h1><ul className="mt-8 space-y-4 text-stone-100">{['Keep every contribution visible', 'Stay close to your community', 'Plan every payout with confidence'].map(item => <li className="flex items-center gap-3" key={item}><span className="grid h-6 w-6 place-items-center rounded-full bg-white/15"><Check size={15}/></span>{item}</li>)}</ul></div><div className="flex items-center gap-2 text-sm text-stone-300"><ShieldCheck size={16}/> Designed for trusted community savings</div></div></section>
    <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10"><div className="w-full max-w-md"><Link to="/" className="mb-10 flex items-center gap-2 text-lg font-bold text-primary-700 lg:hidden"><span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600 text-sm text-white">S</span>StokvelSA</Link>{children}</div></section>
  </main>;
}
