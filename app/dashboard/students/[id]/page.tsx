"use client";

/* Local-storage hydration must populate client state after mount. */
/* eslint-disable react-hooks/set-state-in-effect, react/no-unescaped-entities */

import Link from "next/link";
import { useParams } from "next/navigation";
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

const defaultStudents: Student[] = [
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

export default function StudentProfilePage() {
  const params = useParams();
  const studentId = String(params.id);

  const [student, setStudent] = useState<Student | null>(null);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [className, setClassName] = useState("");
  const [status, setStatus] = useState<"Actif" | "Inactif">("Actif");

  useEffect(() => {
    try {
      const savedStudents = localStorage.getItem("school_students");
      const students: Student[] = savedStudents
        ? JSON.parse(savedStudents)
        : defaultStudents;

      if (!savedStudents) {
        localStorage.setItem(
          "school_students",
          JSON.stringify(defaultStudents)
        );
      }

      const savedClasses = localStorage.getItem("school_classes");
      const parsedClasses: SchoolClass[] = savedClasses
        ? JSON.parse(savedClasses)
        : [];

      setClasses(parsedClasses);

      const found = students.find((item) => item.id === studentId);

      if (found) {
        setStudent(found);
        setName(found.name);
        setEmail(found.email);
        setClassName(found.className);
        setStatus(found.status);
      }
    } catch {
      setStudent(null);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  function openEditForm() {
    if (!student) return;

    // Recharger les classes pour récupérer les dernières modifications.
    try {
      const savedClasses = localStorage.getItem("school_classes");
      const parsedClasses: SchoolClass[] = savedClasses
        ? JSON.parse(savedClasses)
        : [];
      setClasses(parsedClasses);
    } catch {
      setClasses([]);
    }

    setName(student.name);
    setEmail(student.email);
    setClassName(student.className);
    setStatus(student.status);
    setMessage("");
    setEditing(true);
  }

  function saveChanges(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!student) return;

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName || !cleanEmail || !className) {
      setMessage("Merci de remplir tous les champs.");
      return;
    }

    setSaving(true);

    try {
      const savedStudents = localStorage.getItem("school_students");
      const students: Student[] = savedStudents
        ? JSON.parse(savedStudents)
        : defaultStudents;

      const updatedStudent: Student = {
        ...student,
        name: cleanName,
        email: cleanEmail,
        className,
        status,
      };

      const updatedStudents = students.map((item) =>
        item.id === studentId ? updatedStudent : item
      );

      localStorage.setItem(
        "school_students",
        JSON.stringify(updatedStudents)
      );

      setStudent(updatedStudent);
      setEditing(false);
      setMessage("Les informations ont été modifiées avec succès.");
    } catch {
      setMessage("Erreur lors de l'enregistrement. Réessayez.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-500">
        Chargement du profil...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <div className="text-5xl">🔎</div>
        <h1 className="mt-4 text-xl font-bold text-slate-900">
          Étudiant introuvable
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Cet étudiant n'existe pas ou ses informations ne sont pas disponibles.
        </p>
        <Link
          href="/dashboard/students"
          className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Retour aux étudiants
        </Link>
      </div>
    );
  }

  const initials = student.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/students"
          className="text-sm font-medium text-slate-500 hover:text-indigo-600"
        >
          ← Retour aux étudiants
        </Link>

        <button
          type="button"
          onClick={openEditForm}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          ✏️ Modifier le profil
        </button>
      </div>

      {message && (
        <div
          role="status"
          className={`rounded-xl border px-4 py-3 text-sm ${
            message.includes("succès")
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          }`}
        >
          {message}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-100 text-2xl font-bold text-indigo-700">
            {initials}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {student.name}
              </h1>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  student.status === "Actif"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {student.status}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">{student.id}</p>
            <p className="mt-1 text-sm text-slate-600">
              {student.className}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900">
            Informations de l'étudiant
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Informations générales et identifiants.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <InfoItem label="Nom complet" value={student.name} />
            <InfoItem label="Student ID" value={student.id} />
            <InfoItem label="Email" value={student.email} />
            <InfoItem label="Classe" value={student.className} />
            <InfoItem label="Signature unique" value={student.signature} />
            <InfoItem label="Statut" value={student.status} />
          </div>
        </div>

        <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">QR Code</h2>
          <p className="mt-1 text-sm text-slate-500">
            Code d'identification de l'étudiant
          </p>

          <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-4">
            <QRCodeSVG
              value={JSON.stringify({
                studentId: student.id,
                signature: student.signature,
              })}
              size={160}
              level="H"
            />
          </div>

          <p className="mt-4 break-all text-xs text-slate-500">
            {student.signature}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Ce QR Code utilise le même Student ID et la même signature.
          </p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <ProfileCard
          title="Attendance"
          description="Consulter les présences et les retards."
          href="/dashboard/attendance"
          icon="✓"
        />
        <ProfileCard
          title="Diplômes"
          description="Préparer la gestion des diplômes."
          href="/dashboard/documents"
          icon="🎓"
        />
        <ProfileCard
          title="Documents"
          description="Préparer les documents administratifs."
          href="/dashboard/documents"
          icon="📁"
        />
      </section>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4"
          onClick={() => setEditing(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-student-title"
            className="my-8 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="edit-student-title"
                  className="text-xl font-bold text-slate-900"
                >
                  Modifier le profil
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Modifiez les informations de l'étudiant.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditing(false)}
                aria-label="Fermer"
                className="rounded-lg px-3 py-1 text-xl text-slate-500 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <form onSubmit={saveChanges} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="student-name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Nom complet
                </label>
                <input
                  id="student-name"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Ex. Ahmed Amrani"
                />
              </div>

              <div>
                <label
                  htmlFor="student-email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="student-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="exemple@email.com"
                />
              </div>

<div>
  <label
    htmlFor="student-class"
    className="mb-2 block text-sm font-medium text-slate-700"
  >
    Classe
  </label>

  <select
    id="student-class"
    required
    value={className}
    onChange={(event) => setClassName(event.target.value)}
    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
  >
    <option value="" disabled>
      Choisir une classe
    </option>

    {classes.map((item) => (
      <option key={item.id} value={item.name}>
        {item.name} — {item.formation}
      </option>
    ))}
  </select>

  {classes.length === 0 && (
    <p className="mt-2 text-xs text-amber-700">
      Aucune classe enregistrée. Ajoutez d'abord une classe dans la page Classes.
    </p>
  )}
</div>
              <div>
                <label
                  htmlFor="student-status"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Statut
                </label>
                <select
                  id="student-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as "Actif" | "Inactif")
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                Student ID et Signature unique ne sont pas modifiables. Ils
                restent liés au QR Code et au système de présence.
              </div>

              {message && (
                <p role="alert" className="text-sm text-amber-700">
                  {message}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving || classes.length === 0}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Enregistrement..."
                    : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function ProfileCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600">
        {icon}
      </div>
      <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      <p className="mt-4 text-sm font-semibold text-indigo-600">
        Consulter →
      </p>
    </Link>
  );
}