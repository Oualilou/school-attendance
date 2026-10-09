export default function DashboardLoading() {
  return (
    <div aria-label="Chargement du tableau de bord" aria-busy="true" className="mx-auto max-w-7xl space-y-6">
      <div className="space-y-3"><div className="h-3 w-28 animate-pulse rounded bg-slate-200" /><div className="h-9 w-56 max-w-full animate-pulse rounded-lg bg-slate-200" /><div className="h-4 w-80 max-w-full animate-pulse rounded bg-slate-100" /></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="h-4 w-28 animate-pulse rounded bg-slate-100" /><div className="mt-4 h-9 w-16 animate-pulse rounded bg-slate-200" /><div className="mt-3 h-3 w-36 animate-pulse rounded bg-slate-100" /></div>)}</div>
      <div className="grid gap-6 xl:grid-cols-2"><div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" /><div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" /></div>
      <p className="text-sm text-slate-500">Chargement de l’espace d’administration…</p>
    </div>
  );
}
