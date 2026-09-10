import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, Plus } from 'lucide-react';
import { performanceApi } from '../../api/performanceApi';
import { employeeApi } from '../../api/employeeApi';
import { useToast } from '../../components/Toast';
import { useAppSelector } from '../../app/hooks';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
        />
      ))}
    </div>
  );
}

export default function PerformancePage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);
  const canReview = user && ['ADMIN', 'HR', 'MANAGER'].includes(user.role);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    employeeId: '', reviewPeriod: '', rating: 4, feedback: '', goalsNextPeriod: '',
  });

  const { data: myReviews, isLoading } = useQuery({
    queryKey: ['my-performance'],
    queryFn: performanceApi.myHistory,
  });

  const { data: employees } = useQuery({
    queryKey: ['employees-simple'],
    queryFn: employeeApi.listSimple,
    enabled: !!canReview,
  });

  const createMutation = useMutation({
    mutationFn: performanceApi.create,
    onSuccess: () => {
      showToast('Review submitted');
      queryClient.invalidateQueries({ queryKey: ['my-performance'] });
      setShowModal(false);
      setForm({ employeeId: '', reviewPeriod: '', rating: 4, feedback: '', goalsNextPeriod: '' });
    },
    onError: () => showToast('Could not submit review', 'error'),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createMutation.mutate({
      employeeId: Number(form.employeeId),
      reviewPeriod: form.reviewPeriod,
      rating: form.rating,
      feedback: form.feedback || undefined,
      goalsNextPeriod: form.goalsNextPeriod || undefined,
    });
  }

  const avgRating = myReviews && myReviews.length > 0
    ? myReviews.reduce((sum, r) => sum + Number(r.rating), 0) / myReviews.length
    : 0;

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Performance</h1>
          <p className="text-slate-500 mt-1">Review history and feedback.</p>
        </div>
        {canReview && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all"
          >
            <Plus size={15} />
            New Review
          </button>
        )}
      </div>

      {/* Summary card */}
      {myReviews && myReviews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-[#0B1120] rounded-3xl p-6 mt-6 overflow-hidden text-white flex items-center gap-6"
        >
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/20 rounded-full blur-[90px]" />
          <div className="relative">
            <p className="text-indigo-300 text-sm mb-1">Average Rating</p>
            <p className="font-display text-4xl font-semibold">{avgRating.toFixed(1)}</p>
          </div>
          <div className="relative">
            <StarRating rating={avgRating} />
            <p className="text-slate-400 text-xs mt-1">{myReviews.length} review(s) total</p>
          </div>
        </motion.div>
      )}

      {/* Review history */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mt-6">
        <h2 className="font-display font-semibold text-slate-800 mb-4">Review History</h2>
        {isLoading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : myReviews?.length === 0 ? (
          <p className="text-sm text-slate-400">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {myReviews?.map((r) => (
              <motion.div
                key={r.review_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-slate-100 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{r.review_period}</p>
                    <p className="text-xs text-slate-400">Reviewed by {r.reviewer_name}</p>
                  </div>
                  <StarRating rating={r.rating} />
                </div>
                {r.feedback && <p className="text-sm text-slate-600 mt-2">{r.feedback}</p>}
                {r.goals_next_period && (
                  <p className="text-xs text-slate-500 mt-2">
                    <span className="font-medium">Goals: </span>
                    {r.goals_next_period}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create review modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <form
            onSubmit={handleSubmit}
            className="relative z-10 w-full max-w-sm bg-white/90 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="font-display text-lg font-semibold text-slate-800 mb-4">New Performance Review</h2>

            <label className="block text-xs font-medium text-slate-600 mb-1">Employee</label>
            <select
              required
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            >
              <option value="">Select employee...</option>
              {employees?.map((e) => (
                <option key={e.employee_id} value={e.employee_id}>
                  {e.first_name} {e.last_name}
                </option>
              ))}
            </select>

            <label className="block text-xs font-medium text-slate-600 mb-1">Review Period</label>
            <input
              required
              placeholder="e.g. 2026-Q3"
              value={form.reviewPeriod}
              onChange={(e) => setForm({ ...form, reviewPeriod: e.target.value })}
              className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            />

            <label className="block text-xs font-medium text-slate-600 mb-1">Rating: {form.rating} / 5</label>
            <input
              type="range"
              min={0}
              max={5}
              step={0.5}
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
              className="w-full mb-3 accent-indigo-600"
            />

            <label className="block text-xs font-medium text-slate-600 mb-1">Feedback</label>
            <textarea
              rows={3}
              value={form.feedback}
              onChange={(e) => setForm({ ...form, feedback: e.target.value })}
              className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            />

            <label className="block text-xs font-medium text-slate-600 mb-1">Goals for Next Period</label>
            <textarea
              rows={2}
              value={form.goalsNextPeriod}
              onChange={(e) => setForm({ ...form, goalsNextPeriod: e.target.value })}
              className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-2 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium hover:shadow-lg disabled:opacity-50"
              >
                {createMutation.isPending ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}