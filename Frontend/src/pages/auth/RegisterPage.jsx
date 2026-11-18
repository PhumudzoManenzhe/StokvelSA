import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../stores/authStore';
import AuthLayout from '../../components/layout/AuthLayout';

function Input({ label, name, type, placeholder, optional = false, value, onChange }) {
  return <div><label htmlFor={name} className="label text-stone-700">{label}{optional && <span className="ml-1 font-normal text-stone-400">(optional)</span>}</label><input id={name} name={name} type={type} required={!optional} className="input border-stone-300 py-3" placeholder={placeholder} value={value} onChange={onChange}/></div>;
}

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' });
  const register = useAuthStore(s => s.register);
  const navigate = useNavigate();
  const strength = useMemo(() => [form.password.length >= 8, /[A-Z]/.test(form.password), /\d/.test(form.password)].filter(Boolean).length, [form.password]);
  const update = event => setForm({ ...form, [event.target.name]: event.target.value });
  const next = () => {
    if (!form.fullName.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) return toast.error('Please enter your name and a valid email address.');
    if (form.phone && !/^\+27\d{9}$/.test(form.phone)) return toast.error('Use +27 followed by 9 digits for your phone number.');
    setStep(2);
  };
  const submit = async event => {
    event.preventDefault();
    if (form.password !== form.confirm) return toast.error('Your passwords do not match.');
    if (strength < 3) return toast.error('Choose a stronger password with 8 characters, a capital letter, and a number.');
    setLoading(true);
    try { await register(form); toast.success('Sawubona! Welcome to StokvelSA.'); navigate('/dashboard'); }
    catch { toast.error('We could not create your account. Please try again.'); }
    finally { setLoading(false); }
  };
  const inputProps = name => ({ value: form[name], onChange: update });
  const levels = ['Too short', 'Weak', 'Medium', 'Strong']; const colors = ['bg-stone-200', 'bg-red-500', 'bg-amber-400', 'bg-emerald-500'];

  return <AuthLayout image="/images/auth-register.jpg" imageAlt="A group of South African friends laughing together around a laptop at home" greeting="Ndaa" title="Build more, together.">
    <div className="mb-8"><div className="flex items-center gap-3 text-xs font-semibold"><span className={step === 1 ? 'text-primary-700' : 'text-emerald-600'}>{step > 1 ? <Check size={16}/> : '01'} Personal details</span><span className="h-px flex-1 bg-stone-200"/><span className={step === 2 ? 'text-primary-700' : 'text-stone-400'}>02 Security</span></div><div className="mt-5"><p className="text-sm font-semibold text-primary-700">Join the community</p><h2 className="mt-2 text-3xl font-bold tracking-tight">{step === 1 ? 'Let’s get to know you.' : 'Choose a secure password.'}</h2><p className="mt-2 text-sm text-stone-600">{step === 1 ? 'You are only a few steps from your first stokvel.' : 'A strong password keeps your group’s records protected.'}</p></div></div>
    <form onSubmit={submit} className="space-y-5">
      {step === 1 ? <><Input label="Full name" name="fullName" type="text" placeholder="Your name" {...inputProps('fullName')}/><Input label="Email address" name="email" type="email" placeholder="you@example.com" {...inputProps('email')}/><Input label="South African phone" name="phone" type="tel" placeholder="+27821234567" optional {...inputProps('phone')}/><button type="button" onClick={next} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white hover:bg-primary-700">Continue <ArrowRight size={17}/></button></> : <><Input label="Password" name="password" type="password" placeholder="At least 8 characters" {...inputProps('password')}/>{form.password && <div><div className="flex gap-1">{[1,2,3].map(number => <span key={number} className={`h-1.5 flex-1 rounded ${strength >= number ? colors[strength] : 'bg-stone-200'}`}/>)}</div><p className="mt-1.5 text-xs text-stone-500">Password strength: <span className="font-semibold">{levels[strength]}</span></p></div>}<Input label="Confirm password" name="confirm" type="password" placeholder="Repeat your password" {...inputProps('confirm')}/><div className="flex gap-3"><button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-1 rounded-xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700"><ArrowLeft size={16}/> Back</button><button disabled={loading} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60">{loading ? 'Creating account...' : <>Create account <ArrowRight size={17}/></>}</button></div></>}
    </form><p className="mt-8 text-center text-sm text-stone-600">Already a member? <Link className="font-semibold text-primary-700" to="/login">Sign in</Link></p>
  </AuthLayout>;
}
