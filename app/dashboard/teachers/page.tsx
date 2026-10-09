"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

type Teacher = { id: string; name: string; email: string; phone: string; subject: string; status: "Actif" | "Inactif" };
const STORAGE_KEY = "school_teachers";
const emptyForm = { name: "", email: "", phone: "", subject: "" };

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setTeachers(parsed as Teacher[]);
      }
    } catch {
      setMessage("Impossible de charger les professeurs enregistrés.");
    } finally {
      setReady(true);
    }
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase();
    return teachers.filter((teacher) => [teacher.name, teacher.email, teacher.phone, teacher.subject].some((value) => value.toLocaleLowerCase().includes(q)));
  }, [teachers, search]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setShowForm(true);
  }

  function openEdit(teacher: Teacher) {
    setEditingId(teacher.id);
    setForm({ name: teacher.name, email: teacher.email, phone: teacher.phone, subject: teacher.subject });
    setMessage("");
    setShowForm(true);
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const subject = form.subject.trim();
    if (!name || !email || !subject) {
      setMessage("Le nom, l’email et la matière sont obligatoires.");
      return;
    }
    const updated = editingId
      ? teachers.map((teacher) => teacher.id === editingId ? { ...teacher, ...form, name, email, subject, phone: form.phone.trim() } : teacher)
      : [{ id: `TCH-${Date.now()}`, ...form, name, email, subject, phone: form.phone.trim(), status: "Actif" as const }, ...teachers];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setTeachers(updated);
      setShowForm(false);
      setMessage(editingId ? "Professeur modifié." : "Professeur ajouté.");
    } catch {
      setMessage("Enregistrement impossible. Vérifiez l’espace disponible du navigateur.");
    }
  }

  function remove(teacher: Teacher) {
    if (!window.confirm(`Supprimer le professeur « ${teacher.name} » ?`)) return;
    const updated = teachers.filter((item) => item.id !== teacher.id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setTeachers(updated);
      setMessage("Professeur supprimé.");
    } catch {
      setMessage("Suppression impossible.");
    }
  }

  if (!ready) return <p className="p-6 text-sm text-slate-500">Chargement des professeurs…</p>;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-medium text-indigo-600">Gestion scolaire</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Professeurs</h1><p className="mt-2 text-sm text-slate-500">Gérez les enseignants, leurs matières et leurs coordonnées.</p></div>
        <button onClick={openAdd} type="button" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">+ Ajouter un professeur</button>
      </header>

      {message && <p role="status" className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">{message}</p>}

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Total professeurs</p><p className="mt-2 text-3xl font-bold text-slate-900">{teachers.length}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Professeurs actifs</p><p className="mt-2 text-3xl font-bold text-slate-900">{teachers.filter((teacher) => teacher.status === "Actif").length}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><label htmlFor="teacher-search" className="mb-2 block text-sm font-medium text-slate-700">Rechercher</label><input id="teacher-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nom, email, matière…" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /></div>
      </section>

      {showForm && <section className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900">{editingId ? "Modifier le professeur" : "Nouveau professeur"}</h2><button type="button" onClick={() => setShowForm(false)} className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100">Fermer</button></div><form onSubmit={save} className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="teacher-name" className="mb-1.5 block text-sm font-medium text-slate-700">Nom complet *</label><input id="teacher-name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" /></div><div><label htmlFor="teacher-email" className="mb-1.5 block text-sm font-medium text-slate-700">Email *</label><input id="teacher-email" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" /></div><div><label htmlFor="teacher-subject" className="mb-1.5 block text-sm font-medium text-slate-700">Matière *</label><input id="teacher-subject" required value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} placeholder="Ex. Mathématiques" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" /></div><div><label htmlFor="teacher-phone" className="mb-1.5 block text-sm font-medium text-slate-700">Téléphone</label><input id="teacher-phone" type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" /></div><div className="flex flex-col gap-2 pt-2 sm:col-span-2 sm:flex-row"><button type="submit" className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700">Enregistrer</button><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Annuler</button></div></form></section>}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-slate-900">Liste des professeurs</h2><p className="mt-1 text-sm text-slate-500">{filtered.length} résultat(s)</p></div>{filtered.length === 0 ? <div className="px-5 py-14 text-center"><div className="text-4xl">👩‍🏫</div><h3 className="mt-3 font-semibold text-slate-900">Aucun professeur trouvé</h3><p className="mt-1 text-sm text-slate-500">Ajoutez un professeur ou modifiez votre recherche.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Professeur</th><th className="px-5 py-3 font-semibold">Matière</th><th className="px-5 py-3 font-semibold">Téléphone</th><th className="px-5 py-3 font-semibold">Statut</th><th className="px-5 py-3 text-right font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((teacher) => <tr key={teacher.id} className="hover:bg-slate-50"><td className="px-5 py-4"><p className="font-semibold text-slate-900">{teacher.name}</p><p className="mt-1 text-xs text-slate-500">{teacher.email}</p></td><td className="px-5 py-4 text-sm text-slate-700">{teacher.subject}</td><td className="px-5 py-4 text-sm text-slate-700">{teacher.phone || "—"}</td><td className="px-5 py-4"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{teacher.status}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => openEdit(teacher)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Modifier</button><button type="button" onClick={() => remove(teacher)} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">Supprimer</button></div></td></tr>)}</tbody></table></div>}</section>
    </div>
  );
}
