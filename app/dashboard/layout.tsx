"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: "▦" },
  { label: "Étudiants", href: "/dashboard/students", icon: "♙" },
  { label: "Professeurs", href: "/dashboard/teachers", icon: "♙" },
  { label: "Classes", href: "/dashboard/classes", icon: "▤" },
  { label: "Présences", href: "/dashboard/attendance", icon: "✓" },
  { label: "Diplômes & Documents", href: "/dashboard/documents", icon: "▣" },
];

function isActive(pathname: string, href: string) {
  return href === "/dashboard"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="flex h-20 items-center border-b border-slate-200 px-6">
          <div>
            <Link href="/dashboard" className="text-xl font-bold tracking-tight text-slate-900">
              School<span className="text-indigo-600">Attend</span>
            </Link>
            <p className="text-xs text-slate-500">Système de gestion scolaire</p>
          </div>
        </div>

        <nav aria-label="Menu principal" className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Menu principal
          </p>
          {navigation.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"}`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${active ? "bg-white text-indigo-600 shadow-sm" : "bg-slate-100"}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-900">Administration</p>
            <p className="mt-1 text-xs text-slate-500">Directeur / Admin</p>
          </div>
        </div>
      </aside>

      <div className="min-w-0 lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:min-h-20 lg:px-8">
            <div className="min-w-0">
              <p className="text-xs text-slate-500 sm:text-sm">Bienvenue 👋</p>
              <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
                Administration
              </h2>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <span className="hidden text-right sm:block">
                <span className="block text-sm font-semibold text-slate-900">Directeur</span>
                <span className="block text-xs text-slate-500">Administrateur</span>
              </span>
              <div
                aria-label="Profil administrateur"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white sm:h-10 sm:w-10"
              >
                A
              </div>
            </div>
          </div>

          <nav aria-label="Navigation mobile" className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2 lg:hidden">
            {navigation.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm ${active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
