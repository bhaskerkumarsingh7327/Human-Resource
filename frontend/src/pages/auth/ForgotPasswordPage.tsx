import { useState } from 'react';
import type {  FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../api/authApi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => setSubmitted(true),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate({ email });
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0B1120]">
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm mx-4 bg-white/[0.07] backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-8">
        {submitted ? (
          <div>
            <h1 className="text-xl font-semibold text-white mb-2">Check your email</h1>
            <p className="text-sm text-slate-400">
              If an account exists for <span className="text-slate-200">{email}</span>, a reset link
              has been sent. It expires in 15 minutes.
            </p>
            <Link
              to="/login"
              className="inline-block mt-6 text-sm text-indigo-400 hover:text-indigo-300"
            >
              ← Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h1 className="text-xl font-semibold text-white mb-1">Forgot password</h1>
            <p className="text-sm text-slate-400 mb-6">
              Enter your email and we'll send you a reset link.
            </p>

            <label className="block text-sm text-slate-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition mb-4"
            />

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-indigo-500/25"
            >
              {mutation.isPending ? 'Sending...' : 'Send reset link'}
            </button>

            <Link
              to="/login"
              className="block text-center mt-4 text-sm text-slate-400 hover:text-slate-200"
            >
              ← Back to login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}