"use client";

/* Local-storage hydration must populate client state after mount. */
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, type FormEvent } from "react";
import { QRCodeSVG } from "qrcode.react";

type Student = {
  id: string;
  name: string;
  email: string;
  className: string;
  status: "Actif" | "Inactif";
  signature: string;
};

type SchoolClass = {
  id: string;
  name: string;
  formation: string;
  address: string;
  city: string;
  room: string;
};

const initialStudents: Student[] = [
  {
    id: "STU-2026-0001",
    name: "Ahmed Amrani",
    email: "ahmed@example.com",
    className: "1ère Année A",
    status: "Actif",
    signature: "SA-7F4K-92MX",
  },
  {
    id: "STU-2026-0002",
    name: "Sara Benali",
    email: "sara@example.com",
    className: "2ème Année B",
    status: "Actif",
    signature: "SA-3K8P-41QZ",
  },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [ready, setReady] = useState(false);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [cardStudent, setCardStudent] = useState<Student | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    className: "",
  });

  useEffect(() => {
    try {
      const savedStudents = localStorage.getItem("school_students");

      if (savedStudents) {
        setStudents(JSON.parse(savedStudents));
      } else {
        localStorage.setItem(
          "school_students",
          JSON.stringify(initialStudents)
        );
        setStudents(initialStudents);
      }

      const savedClasses = localStorage.getItem("school_classes");

      if (savedClasses) {
        setClasses(JSON.parse(savedClasses));
      } else {
        setClasses([]);
      }
    } catch {
      setMessage("Erreur lors du chargement des données.");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem("school_students", JSON.stringify(students));
    }
  }, [students, ready]);

  const filteredStudents = students.filter((student) => {
    const value = search.toLowerCase();

    return (
      student.name.toLowerCase().includes(value) ||
      student.id.toLowerCase().includes(value) ||
      student.email.toLowerCase().includes(value) ||
      student.className.toLowerCase().includes(value)
    );
  });

  function generateSignature() {
    return `SA-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;
  }

  function openForm() {
    // Actualiser la liste au cas où des classes ont été ajoutées.
    try {
      const savedClasses = localStorage.getItem("school_classes");
      setClasses(savedClasses ? JSON.parse(savedClasses) : []);
    } catch {
      setClasses([]);
    }

    setForm({
      firstName: "",
      lastName: "",
      email: "",
      className: "",
    });

    setMessage("");
    setShowForm(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.className
    ) {
      setMessage("Merci de remplir tous les champs.");
      return;
    }

    const selectedClass = classes.find(
      (item) => item.name === form.className
    );

    if (!selectedClass) {
      setMessage(
        "Cette classe n'existe plus. Actualisez la liste et réessayez."
      );
      return;
    }

    const newStudent: Student = {
      id: `STU-${new Date().getFullYear()}-${String(
        Date.now()
      ).slice(-6)}`,
      name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      email: form.email.trim(),
      className: selectedClass.name,
      status: "Actif",
      signature: generateSignature(),
    };

    const updatedStudents = [newStudent, ...students];

    try {
      localStorage.setItem(
        "school_students",
        JSON.stringify(updatedStudents)
      );

      setStudents(updatedStudents);
      setShowForm(false);
      setMessage("Étudiant ajouté avec succès.");
    } catch {
      setMessage("Erreur lors de l'enregistrement de l'étudiant.");
    }
  }


  function printStudentCard() {
    window.print();
  }

  async function shareStudentCard(student: Student) {
    const messageText = `Carte d'élève — ${student.name}\nIdentifiant : ${student.id}\nClasse : ${student.className}\nSignature : ${student.signature}\nStatut : ${student.status}`;
    const qrElement = document.getElementById(`student-card-qr-${student.id}`);

    if (qrElement && typeof navigator.share === "function" && typeof navigator.canShare === "function") {
      try {
        const svgMarkup = new XMLSerializer().serializeToString(qrElement);
        const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);
        const image = new Image();

        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject(new Error("Impossible de créer l'image du QR code."));
          image.src = svgUrl;
        });

        const canvas = document.createElement("canvas");
        canvas.width = 600;
        canvas.height = 600;
        const context = canvas.getContext("2d");

        if (!context) throw new Error("Canvas indisponible.");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 20, 20, 560, 560);
        URL.revokeObjectURL(svgUrl);

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Export image impossible.")), "image/png");
        });
        const file = new File([blob], `QR-${student.id}.png`, { type: "image/png" });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ title: `Carte d'élève — ${student.name}`, text: messageText, files: [file] });
          return;
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(messageText)}`, "_blank", "noopener,noreferrer");
  }

  if (!ready) {
    return <p className="p-8 text-slate-500">Chargement des étudiants...</p>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            Gestion scolaire
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Students
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Gérez les étudiants et leurs informations.
          </p>
        </div>

        <button
          type="button"
          onClick={openForm}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          + Ajouter un étudiant
        </button>
      </section>

      {message && !showForm && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {message}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          type="search"
          aria-label="Rechercher un étudiant"
          placeholder="Rechercher par nom, ID, email ou classe..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Liste des étudiants
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {filteredStudents.length} étudiant(s)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Étudiant</th>
                <th className="px-6 py-4">Identifiant</th>
                <th className="px-6 py-4">Classe</th>
                <th className="px-6 py-4">Signature</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                        {student.name.charAt(0)}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900">
                          {student.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-slate-700">
                    {student.id}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {student.className}
                  </td>

                  <td className="px-6 py-4">
                    <code className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700">
                      {student.signature}
                    </code>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        student.status === "Actif"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setCardStudent(student)}
                        className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                      >
                        Carte / QR
                      </button>
                      <a
                        href={`/dashboard/students/${student.id}`}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                      >
                        Voir profil
                      </a>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <p className="font-medium text-slate-700">
                      Aucun étudiant trouvé
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Essayez une autre recherche.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>


      {cardStudent && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4"
          onClick={() => setCardStudent(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-card-title"
            className="my-6 w-full max-w-xl rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3 print:hidden">
              <div>
                <h2 id="student-card-title" className="text-xl font-bold text-slate-900">Carte d'élève</h2>
                <p className="mt-1 text-sm text-slate-500">Imprimez la carte ou partagez le QR code sur WhatsApp.</p>
              </div>
              <button type="button" onClick={() => setCardStudent(null)} aria-label="Fermer" className="rounded-lg px-3 py-1 text-xl text-slate-500 hover:bg-slate-100">×</button>
            </div>

            <div id="student-card-print" className="mx-auto max-w-[440px] overflow-hidden rounded-2xl border-2 border-indigo-700 bg-white text-slate-900">
              <div className="bg-indigo-700 px-5 py-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-100">SchoolAttend</p>
                <h3 className="mt-1 text-xl font-extrabold">CARTE D'ÉLÈVE</h3>
              </div>
              <div className="grid grid-cols-[1fr_auto] items-center gap-4 p-5">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nom complet</p>
                  <p className="mt-1 break-words text-lg font-bold">{cardStudent.name}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Identifiant</p>
                  <p className="mt-1 break-all font-mono text-sm font-bold">{cardStudent.id}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Classe</p>
                  <p className="mt-1 text-sm font-semibold">{cardStudent.className}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Signature</p>
                  <p className="mt-1 break-all font-mono text-xs">{cardStudent.signature}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-2">
                  <QRCodeSVG
                    id={`student-card-qr-${cardStudent.id}`}
                    value={JSON.stringify({ studentId: cardStudent.id, signature: cardStudent.signature })}
                    size={116}
                    level="H"
                    includeMargin
                  />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs">
                <span className="font-semibold">Statut : {cardStudent.status}</span>
                <span className="text-slate-500">Gestion scolaire</span>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 print:hidden">
              <button type="button" onClick={printStudentCard} className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
                Imprimer la carte
              </button>
              <button type="button" onClick={() => void shareStudentCard(cardStudent)} className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
                Partager sur WhatsApp
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-slate-500 print:hidden">
              Si le partage de fichiers n'est pas pris en charge par votre appareil, WhatsApp s'ouvrira avec les informations de l'élève.
            </p>
            <style jsx global>{`
              @media print {
                body * { visibility: hidden !important; }
                #student-card-print, #student-card-print * { visibility: visible !important; }
                #student-card-print {
                  position: fixed !important;
                  left: 50% !important;
                  top: 20mm !important;
                  transform: translateX(-50%) !important;
                  width: 90mm !important;
                  max-width: 90mm !important;
                  box-shadow: none !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                @page { size: auto; margin: 10mm; }
              }
            `}</style>
          </div>
        </div>
      )}

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-form-title"
            className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2
                  id="student-form-title"
                  className="text-xl font-bold text-slate-900"
                >
                  Ajouter un étudiant
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Créez le profil de base de l&apos;étudiant.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Fermer"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="first-name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Prénom *
                  </label>
                  <input
                    id="first-name"
                    required
                    value={form.firstName}
                    onChange={(event) =>
                      setForm({ ...form, firstName: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Prénom"
                  />
                </div>

                <div>
                  <label
                    htmlFor="last-name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Nom *
                  </label>
                  <input
                    id="last-name"
                    required
                    value={form.lastName}
                    onChange={(event) =>
                      setForm({ ...form, lastName: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Nom"
                  />
                </div>

                <div>
                  <label
                    htmlFor="student-email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email *
                  </label>
                  <input
                    id="student-email"
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="student-class"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Classe *
                  </label>
                  <select
                    id="student-class"
                    required
                    value={form.className}
                    onChange={(event) =>
                      setForm({ ...form, className: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">Sélectionner une classe</option>

                    {classes.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name} — {item.formation}
                      </option>
                    ))}
                  </select>

                  {classes.length === 0 && (
                    <p className="mt-2 text-xs text-amber-700">
                      Aucune classe enregistrée. Ajoutez d&apos;abord une classe
                      dans la rubrique Classes.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-indigo-50 p-4">
                <p className="text-sm font-semibold text-indigo-900">
                  Identifiants automatiques
                </p>
                <p className="mt-1 text-xs leading-5 text-indigo-700">
                  L’identifiant étudiant et la signature seront générés automatiquement.
                </p>
              </div>

              {message && (
                <p role="alert" className="text-sm text-amber-700">
                  {message}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={classes.length === 0}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Créer l&apos;étudiant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}