import { useState} from 'react';
import type {  FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../api/authApi';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      navigate('/login', { state: { resetSuccess: true } });
    },
    onError: () => {
      setError('This reset link is invalid or has expired. Please request a new one.');
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    mutation.mutate({ token, newPassword });
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1120]">
        <p className="text-slate-300">
          Invalid link. Please{' '}
          <Link to="/forgot-password" className="text-indigo-400 hover:underline">
            request a new reset link
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0B1120]">
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[120px]" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm mx-4 bg-white/[0.07] backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-8"
      >
        <h1 className="text-xl font-semibold text-white mb-1">Set a new password</h1>
        <p className="text-sm text-slate-400 mb-6">Choose a strong password for your account.</p>

        <label className="block text-sm text-slate-300 mb-1.5">New password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition mb-4"
        />

        <label className="block text-sm text-slate-300 mb-1.5">Confirm password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition mb-4"
        />

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-indigo-500/25"
        >
          {mutation.isPending ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
    </div>
  );
}