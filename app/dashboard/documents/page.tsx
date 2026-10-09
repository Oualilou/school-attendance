"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState, type FormEvent } from "react";

type Student = { id: string; name: string; email: string; className: string; status: string; signature: string };
type SchoolDocument = { id: string; title: string; type: string; studentId: string; studentName: string; createdAt: string; reference: string };
const DOC_KEY = "school_documents";
const STUDENT_KEY = "school_students";
const types = ["Attestation de scolarité", "Certificat de présence", "Relevé de notes", "Diplôme", "Autre"];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<SchoolDocument[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: types[0], studentId: "", notes: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const savedDocs = localStorage.getItem(DOC_KEY);
      const savedStudents = localStorage.getItem(STUDENT_KEY);
      if (savedDocs) {
        const parsed: unknown = JSON.parse(savedDocs);
        if (Array.isArray(parsed)) setDocuments(parsed as SchoolDocument[]);
      }
      if (savedStudents) {
        const parsed: unknown = JSON.parse(savedStudents);
        if (Array.isArray(parsed)) setStudents(parsed as Student[]);
      }
    } catch {
      setMessage("Impossible de charger les données des documents.");
    } finally {
      setReady(true);
    }
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase();
    return documents.filter((doc) => [doc.title, doc.type, doc.studentName, doc.reference].some((value) => value.toLocaleLowerCase().includes(q)));
  }, [documents, search]);

  function createDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const student = students.find((item) => item.id === form.studentId);
    if (!student) {
      setMessage("Sélectionnez un étudiant valide avant de créer le document.");
      return;
    }
    const now = new Date();
    const doc: SchoolDocument = {
      id: `DOC-${Date.now()}`,
      title: form.notes.trim() || form.type,
      type: form.type,
      studentId: student.id,
      studentName: student.name,
      createdAt: now.toLocaleDateString("fr-FR"),
      reference: `DOC-${now.getFullYear()}-${String(Date.now()).slice(-6)}`,
    };
    const updated = [doc, ...documents];
    try {
      localStorage.setItem(DOC_KEY, JSON.stringify(updated));
      setDocuments(updated);
      setShowForm(false);
      setForm({ type: types[0], studentId: "", notes: "" });
      setMessage("Document ajouté au registre. Vous pouvez l’ouvrir pour l’imprimer.");
    } catch {
      setMessage("Impossible d’enregistrer le document.");
    }
  }

  function printDocument(doc: SchoolDocument) {
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) {
      setMessage("Autorisez les fenêtres contextuelles pour imprimer ce document.");
      return;
    }
    const safe = (value: string) => value.replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[character] ?? character));
    printWindow.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${safe(doc.type)}</title><style>body{font-family:Arial,sans-serif;color:#172033;margin:64px;line-height:1.7}header{border-bottom:3px solid #4338ca;padding-bottom:20px}h1{font-size:28px}main{margin-top:50px;min-height:300px}footer{margin-top:60px;border-top:1px solid #ddd;padding-top:18px;font-size:12px;color:#667085}.ref{color:#4338ca;font-weight:bold}</style></head><body><header><strong>SchoolAttend</strong><p>Établissement scolaire</p></header><main><h1>${safe(doc.type)}</h1><p>Le présent document concerne :</p><h2>${safe(doc.studentName)}</h2><p>Document enregistré le ${safe(doc.createdAt)}.</p>${doc.title !== doc.type ? `<p>${safe(doc.title)}</p>` : ""}<p class="ref">Référence : ${safe(doc.reference)}</p><p>Ce modèle est un aperçu imprimable à compléter et valider par l’administration de l’établissement.</p></main><footer>SchoolAttend — document généré depuis le registre local. Une validation administrative peut être nécessaire.</footer><script>window.onload=()=>window.print()<\/script></body></html>`);
    printWindow.document.close();
  }

  function remove(doc: SchoolDocument) {
    if (!window.confirm(`Supprimer le document « ${doc.title} » du registre ?`)) return;
    const updated = documents.filter((item) => item.id !== doc.id);
    try {
      localStorage.setItem(DOC_KEY, JSON.stringify(updated));
      setDocuments(updated);
      setMessage("Document retiré du registre.");
    } catch {
      setMessage("Suppression impossible.");
    }
  }

  if (!ready) return <p className="p-6 text-sm text-slate-500">Chargement des documents…</p>;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-indigo-600">Administration</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Diplômes & documents</h1><p className="mt-2 text-sm text-slate-500">Préparez un registre des documents scolaires et imprimez des modèles.</p></div><button type="button" onClick={() => { setMessage(""); setShowForm((value) => !value); }} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700">+ Nouveau document</button></header>
      {message && <p role="status" className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">{message}</p>}
      <section className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Documents enregistrés</p><p className="mt-2 text-3xl font-bold text-slate-900">{documents.length}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Types disponibles</p><p className="mt-2 text-3xl font-bold text-slate-900">{types.length}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><label htmlFor="document-search" className="mb-2 block text-sm font-medium text-slate-700">Rechercher un document</label><input id="document-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Type, étudiant, référence…" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" /></div></section>
      {showForm && <section className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm sm:p-6"><h2 className="mb-5 text-lg font-semibold text-slate-900">Créer une entrée de document</h2><form onSubmit={createDocument} className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="document-type" className="mb-1.5 block text-sm font-medium text-slate-700">Type de document</label><select id="document-type" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">{types.map((type) => <option key={type}>{type}</option>)}</select></div><div><label htmlFor="document-student" className="mb-1.5 block text-sm font-medium text-slate-700">Étudiant</label><select id="document-student" required value={form.studentId} onChange={(event) => setForm({ ...form, studentId: event.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">Choisir un étudiant…</option>{students.map((student) => <option key={student.id} value={student.id}>{student.name} — {student.id}</option>)}</select>{students.length === 0 && <p className="mt-1 text-xs text-amber-700">Ajoutez d’abord un étudiant dans la page Students.</p>}</div><div className="sm:col-span-2"><label htmlFor="document-notes" className="mb-1.5 block text-sm font-medium text-slate-700">Intitulé ou précision (facultatif)</label><input id="document-notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Ex. Année scolaire 2026–2027" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div><div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row"><button type="submit" disabled={students.length === 0} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">Enregistrer le document</button><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">Annuler</button></div></form></section>}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-slate-900">Registre des documents</h2><p className="mt-1 text-sm text-slate-500">{filtered.length} document(s)</p></div>{filtered.length === 0 ? <div className="px-5 py-14 text-center"><div className="text-4xl">📄</div><h3 className="mt-3 font-semibold text-slate-900">Aucun document enregistré</h3><p className="mt-1 text-sm text-slate-500">Créez une entrée pour un étudiant afin de la retrouver et l’imprimer.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Document</th><th className="px-5 py-3 font-semibold">Étudiant</th><th className="px-5 py-3 font-semibold">Date</th><th className="px-5 py-3 font-semibold">Référence</th><th className="px-5 py-3 text-right font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((doc) => <tr key={doc.id} className="hover:bg-slate-50"><td className="px-5 py-4"><p className="font-semibold text-slate-900">{doc.title}</p><p className="mt-1 text-xs text-slate-500">{doc.type}</p></td><td className="px-5 py-4 text-sm text-slate-700">{doc.studentName}</td><td className="px-5 py-4 text-sm text-slate-700">{doc.createdAt}</td><td className="px-5 py-4 font-mono text-xs text-slate-600">{doc.reference}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => printDocument(doc)} className="rounded-lg border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50">Imprimer</button><button type="button" onClick={() => remove(doc)} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">Supprimer</button></div></td></tr>)}</tbody></table></div>}</section>
      <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">Important : les données sont stockées dans le navigateur pour cette première version frontend. Les modèles imprimés ne sont pas des documents officiels et doivent être vérifiés par l’administration.</p>
    </div>
  );
}
