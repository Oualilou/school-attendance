import Link from "next/link";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "▦",
  },
  {
    label: "Students",
    href: "/dashboard/students",
    icon: "♙",
  },
  {
    label: "Professeurs",
    href: "/dashboard/teachers",
    icon: "♙",
  },
  {
    label: "Classes",
    href: "/dashboard/classes",
    icon: "▤",
  },
  {
    label: "Attendance",
    href: "/dashboard/attendance",
    icon: "✓",
  },
  {
    label: "Diplômes & Documents",
    href: "/dashboard/documents",
    icon: "▣",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="flex h-20 items-center border-b border-slate-200 px-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              School<span className="text-indigo-600">Attend</span>
            </h1>
            <p className="text-xs text-slate-500">
              Management System
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Menu principal
          </p>

          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm">
                {item.icon}
              </span>

              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-900">
              Administration
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Directeur / Admin
            </p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
          <div>
            <p className="text-sm text-slate-500">Bienvenue 👋</p>
            <h2 className="text-lg font-semibold text-slate-900">
              Administration
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              aria-label="Notifications"
            >
              🔔
            </button>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  Directeur
                </p>
                <p className="text-xs text-slate-500">
                  Administrateur
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
                A
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}