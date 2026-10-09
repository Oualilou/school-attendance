"use client";

/* Hydrate dashboard metrics from browser-local records after mount. */
/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useEffect, useState } from "react";

type Student = { id: string; name: string; status?: string };
type Teacher = { id: string; name: string; status?: string };
type SchoolClass = { id: string; name: string };
type AttendanceRecord = { id: string; studentName: string; date: string; time: string; status: string };
type Metrics = { students: number; activeStudents: number; teachers: number; classes: number; attendanceRate: number; todayCount: number; recent: AttendanceRecord[] };

const emptyMetrics: Metrics = { students: 0, activeStudents: 0, teachers: 0, classes: 0, attendanceRate: 0, todayCount: 0, recent: [] };
const quickActions = [
  { title: "Ajouter un étudiant", description: "Créer un profil et l’affecter à une classe", href: "/dashboard/students", icon: "＋" },
  { title: "Enregistrer une présence", description: "Scanner un QR code ou gérer les présences", href: "/dashboard/attendance", icon: "✓" },
  { title: "Gérer les classes", description: "Consulter les classes et les formations", href: "/dashboard/classes", icon: "▤" },
  { title: "Ajouter un professeur", description: "Gérer l’équipe pédagogique", href: "/dashboard/teachers", icon: "♙" },
];

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics>(emptyMetrics);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const readArray = <T,>(key: string): T[] => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed as T[] : [];
      } catch {
        return [];
      }
    };
    const students = readArray<Student>("school_students");
    const teachers = readArray<Teacher>("school_teachers");
    const classes = readArray<SchoolClass>("school_classes");
    const attendance = readArray<AttendanceRecord>("school_attendance");
    const today = new Date().toLocaleDateString("fr-FR");
    const todaysAttendance = attendance.filter((item) => item.date === today);
    const present = todaysAttendance.filter((item) => item.status === "Présent" || item.status === "Retard").length;
    setMetrics({
      students: students.length,
      activeStudents: students.filter((item) => item.status !== "Inactif").length,
      teachers: teachers.length,
      classes: classes.length,
      attendanceRate: todaysAttendance.length ? Math.round((present / todaysAttendance.length) * 100) : 0,
      todayCount: todaysAttendance.length,
      recent: [...attendance].slice(0, 5),
    });
    setReady(true);
  }, []);

  const stats = [
    { title: "Étudiants", value: ready ? String(metrics.students) : "—", description: ready ? `${metrics.activeStudents} actifs` : "Chargement…", icon: "♙", tint: "bg-indigo-50 text-indigo-700", href: "/dashboard/students" },
    { title: "Professeurs", value: ready ? String(metrics.teachers) : "—", description: "Équipe pédagogique", icon: "♧", tint: "bg-sky-50 text-sky-700", href: "/dashboard/teachers" },
    { title: "Classes", value: ready ? String(metrics.classes) : "—", description: "Formations configurées", icon: "▤", tint: "bg-violet-50 text-violet-700", href: "/dashboard/classes" },
    { title: "Présence aujourd’hui", value: ready && metrics.todayCount ? `${metrics.attendanceRate}%` : "—", description: ready ? `${metrics.todayCount} enregistrement(s) aujourd’hui` : "Chargement…", icon: "✓", tint: "bg-emerald-50 text-emerald-700", href: "/dashboard/attendance" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-7 sm:space-y-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold text-indigo-600">Vue générale</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Dashboard</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Suivez les indicateurs de votre établissement et accédez rapidement aux outils de gestion.</p></div>
        <Link href="/dashboard/students" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">＋ Ajouter un étudiant</Link>
      </section>

      <section aria-label="Indicateurs de l’établissement" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => <Link key={stat.title} href={stat.href} className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm font-medium text-slate-500">{stat.title}</p><p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p><p className="mt-1 text-xs text-slate-500">{stat.description}</p></div><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${stat.tint}`}>{stat.icon}</span></div><span className="mt-4 inline-block text-xs font-semibold text-indigo-600 opacity-0 transition group-hover:opacity-100">Ouvrir →</span></Link>)}
      </section>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6"><div><h2 className="text-lg font-semibold text-slate-900">Activité récente</h2><p className="mt-1 text-sm text-slate-500">Derniers enregistrements de présence.</p></div><Link href="/dashboard/attendance" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Voir les présences →</Link></div>
          {metrics.recent.length === 0 ? <div className="flex min-h-56 flex-col items-center justify-center px-5 py-10 text-center"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">▤</span><p className="mt-4 text-sm font-semibold text-slate-800">Aucune activité pour le moment</p><p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">Les présences enregistrées apparaîtront ici. Vous pouvez commencer depuis la page de gestion des présences.</p><Link href="/dashboard/attendance" className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Ouvrir les présences</Link></div> : <div className="divide-y divide-slate-100">{metrics.recent.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6"><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700">{item.studentName.slice(0, 1).toLocaleUpperCase()}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{item.studentName}</p><p className="mt-1 text-xs text-slate-500">{item.date} · {item.time}</p></div></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === "Présent" ? "bg-emerald-50 text-emerald-700" : item.status === "Retard" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>{item.status}</span></div>)}</div>}
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-semibold text-slate-900">Actions rapides</h2><p className="mt-1 text-sm text-slate-500">Les tâches les plus courantes.</p><div className="mt-5 space-y-3">{quickActions.map((action) => <Link key={action.href} href={action.href} className="group flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-indigo-200 hover:bg-indigo-50 sm:gap-4 sm:p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-700 transition group-hover:bg-white">{action.icon}</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900 group-hover:text-indigo-700">{action.title}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{action.description}</span></span><span aria-hidden="true" className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-600">→</span></Link>)}</div></div>
      </section>
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">Version frontend : les données sont actuellement enregistrées dans ce navigateur. La connexion à une base de données partagée sera ajoutée dans l’étape architecture.</p>
    </div>
  );
}
