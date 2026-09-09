export function CardSkeleton() {
  return (
    <div className="bg-white/70 border border-slate-200/60 rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-200 rounded w-2/3" />
          <div className="h-2.5 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-1.5 mt-4">
        <div className="h-5 bg-slate-200 rounded w-16" />
        <div className="h-5 bg-slate-200 rounded w-20" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
      <div className="h-3 bg-slate-200 rounded w-1/2 mb-3" />
      <div className="h-7 bg-slate-200 rounded w-1/3" />
    </div>
  );
}