"use client";

/* Local-storage hydration must populate client state after mount. */
/* eslint-disable react-hooks/set-state-in-effect, react/no-unescaped-entities */

import { useEffect, useRef, useState } from "react";
import type { Html5Qrcode } from "html5-qrcode";

type Student = {
  id: string;
  name: string;
  email: string;
  className: string;
  status: "Actif" | "Inactif";
  signature: string;
};

type AttendanceRecord = {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  signature: string;
  date: string;
  time: string;
  status: "Présent" | "Retard" | "Absent";
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

export default function AttendancePage() {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [message, setMessage] = useState("");
  const [scannerStarted, setScannerStarted] = useState(false);

  useEffect(() => {
    const savedStudents = localStorage.getItem("school_students");

    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    } else {
      setStudents(defaultStudents);
      localStorage.setItem(
        "school_students",
        JSON.stringify(defaultStudents)
      );
    }

    const savedAttendance = localStorage.getItem("school_attendance");

    if (savedAttendance) {
      setAttendance(JSON.parse(savedAttendance));
    }
  }, []);

  async function startScanner() {
    if (scannerStarted) return;

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      const scanner = new Html5Qrcode("qr-reader");

      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
        },
        (decodedText: string) => {
          handleQRCode(decodedText);
        },
        () => {}
      );

      setScannerStarted(true);
      setMessage("Caméra activée. Placez le QR Code devant la caméra.");
    } catch (error) {
      console.error(error);

      setMessage(
        "Impossible d'activer la caméra. Vérifiez l'autorisation du navigateur."
      );
    }
  }

  async function stopScanner() {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      }

      setScannerStarted(false);
    } catch (error) {
      console.error(error);
    }
  }

  function handleQRCode(decodedText: string) {
    try {
      const qrData = JSON.parse(decodedText);

      const student = students.find(
        (item) =>
          item.id === qrData.studentId ||
          item.signature === qrData.signature
      );

      if (!student) {
        setMessage("❌ Étudiant introuvable.");
        return;
      }

      setSelectedStudent(student);
      setMessage(`✅ QR reconnu : ${student.name}`);
    } catch {
      setMessage("❌ QR Code invalide.");
    }
  }

  function markAttendance(status: AttendanceRecord["status"]) {
    if (!selectedStudent) return;

    const now = new Date();

    const date = now.toLocaleDateString("fr-FR");

    const time = now.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const alreadyMarked = attendance.some(
      (record) =>
        record.studentId === selectedStudent.id &&
        record.date === date
    );

    if (alreadyMarked) {
      setMessage(
        `⚠️ ${selectedStudent.name} a déjà été enregistré aujourd'hui.`
      );
      return;
    }

    const newRecord: AttendanceRecord = {
      id: crypto.randomUUID(),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      className: selectedStudent.className,
      signature: selectedStudent.signature,
      date,
      time,
      status,
    };

    const updatedAttendance = [newRecord, ...attendance];

    setAttendance(updatedAttendance);

    localStorage.setItem(
      "school_attendance",
      JSON.stringify(updatedAttendance)
    );

    setMessage(
      `✅ ${selectedStudent.name} a été marqué comme ${status.toLowerCase()}.`
    );

    setSelectedStudent(null);
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {});
      }
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Gestion des présences
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Scannez le QR Code d'un étudiant pour enregistrer sa présence.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700">
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Scanner */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Scanner QR
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Scannez le QR Code de l'étudiant.
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
              📷
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
            <div
              id="qr-reader"
              className="min-h-72"
            />
          </div>

          <div className="mt-5 flex gap-3">
            {!scannerStarted ? (
              <button
                type="button"
                onClick={startScanner}
                className="flex-1 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                📷 Activer la caméra
              </button>
            ) : (
              <button
                type="button"
                onClick={stopScanner}
                className="flex-1 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                ⏹ Arrêter la caméra
              </button>
            )}
          </div>
        </section>

        {/* Student */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Étudiant détecté
          </h2>

          {!selectedStudent ? (
            <div className="mt-6 flex min-h-72 items-center justify-center rounded-2xl bg-slate-50 text-center">
              <div>
                <div className="text-5xl">👨‍🎓</div>

                <p className="mt-3 font-medium text-slate-700">
                  Aucun étudiant détecté
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Scannez un QR Code pour continuer.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-xl font-bold text-indigo-700">
                    {selectedStudent.name.charAt(0)}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {selectedStudent.name}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {selectedStudent.className}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Student ID
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {selectedStudent.id}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Signature
                    </p>

                    <p className="mt-1 font-mono text-sm font-semibold text-slate-800">
                      {selectedStudent.signature}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-3 text-sm font-semibold text-slate-700">
                  Enregistrer la présence
                </p>

                <div className="grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => markAttendance("Présent")}
                    className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    ✓ Présent
                  </button>

                  <button
                    type="button"
                    onClick={() => markAttendance("Retard")}
                    className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-600"
                  >
                    ⏰ Retard
                  </button>

                  <button
                    type="button"
                    onClick={() => markAttendance("Absent")}
                    className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    ✕ Absent
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* History */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Historique des présences
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Les derniers enregistrements de présence.
          </p>
        </div>

        {attendance.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-4xl">📋</div>

            <p className="mt-3 font-medium text-slate-700">
              Aucun enregistrement
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Les présences enregistrées apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Étudiant
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Classe
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Heure
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Statut
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {attendance.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {record.studentName}
                      </p>

                      <p className="text-xs text-slate-500">
                        {record.studentId}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {record.className}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {record.date}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {record.time}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={record.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: AttendanceRecord["status"];
}) {
  const styles = {
    Présent: "bg-emerald-50 text-emerald-700",
    Retard: "bg-amber-50 text-amber-700",
    Absent: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}