export default function SheltersLoading() {
  return (
    <div className="space-y-4">
      <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-3">
          <div className="h-44 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-44 animate-pulse rounded-2xl bg-slate-200" />
        </div>
        <div className="h-[70vh] animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}
