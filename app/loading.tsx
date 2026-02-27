export default function AppLoading() {
  return (
    <div className="space-y-4">
      <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />
      <div className="h-44 animate-pulse rounded-2xl bg-slate-200" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}
