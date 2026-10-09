import Link from "next/link";

const stats = [
  {
    title: "Total Students",
    value: "0",
    description: "Étudiants enregistrés",
    icon: "♙",
  },
  {
    title: "Professeurs",
    value: "0",
    description: "Professeurs actifs",
    icon: "♙",
  },
  {
    title: "Classes",
    value: "0",
    description: "Classes configurées",
    icon: "▤",
  },
  {
    title: "Présence aujourd'hui",
    value: "0%",
    description: "Taux de présence",
    icon: "✓",
  },
];

const quickActions = [
  {
    title: "Ajouter un étudiant",
    description: "Créer le profil complet d'un étudiant",
    href: "/dashboard/students",
    icon: "+",
  },
  {
    title: "Enregistrer une présence",
    description: "Gérer les présences et absences",
    href: "/dashboard/attendance",
    icon: "✓",
  },
  {
    title: "Voir les classes",
    description: "Gérer les classes et niveaux",
    href: "/dashboard/classes",
    icon: "▤",
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section>
        <p className="text-sm font-medium text-indigo-600">
          Vue générale
        </p>

        <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Gérez les étudiants, les professeurs et les présences.
            </p>
          </div>

          <Link
            href="/dashboard/students"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            + Ajouter un étudiant
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {stat.description}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-600">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="min-w-0 rounded-2xl xl:col-span-2 border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Activité récente
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Les dernières activités du système.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
              Aujourd&apos;hui
            </span>
          </div>

          <div className="mt-8 flex min-h-52 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                📋
              </div>

              <p className="mt-3 text-sm font-medium text-slate-700">
                Aucune activité pour le moment
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Les données apparaîtront ici après configuration.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Actions rapides
          </h2>

          <div className="mt-5 space-y-3">
            {quickActions.map((action) => (
              <a
                key={action.title}
                href={action.href}
                className="group flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 font-bold text-indigo-600">
                  {action.icon}
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700">
                    {action.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {action.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}