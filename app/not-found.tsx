import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-2xl font-bold text-indigo-700">404</span>
        <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-indigo-600">Page introuvable</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Cette page n’existe pas</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">Le lien est peut-être incorrect ou la page a été déplacée. Revenez au tableau de bord pour continuer.</p>
        <Link href="/dashboard" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">Retour au Dashboard</Link>
      </section>
    </main>
  );
}
