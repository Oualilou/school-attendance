"use client";

/* Local-storage hydration must populate client state after mount. */
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, type FormEvent } from "react";

type SchoolClass = {
  id: string;
  name: string;
  formation: string;
  address: string;
  city: string;
  room: string;
};

const initialClasses: SchoolClass[] = [
  {
    id: "CLASS-001",
    name: "Français — Niveau 1",
    formation: "Langue française",
    address: "À définir",
    city: "À définir",
    room: "",
  },
];

const emptyForm = {
  name: "",
  formation: "",
  address: "",
  city: "",
  room: "",
};

export default function ClassesPage() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("school_classes");

      if (saved) {
        setClasses(JSON.parse(saved));
      } else {
        localStorage.setItem(
          "school_classes",
          JSON.stringify(initialClasses)
        );
        setClasses(initialClasses);
      }
    } catch {
      setClasses(initialClasses);
    } finally {
      setLoading(false);
    }
  }, []);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setModalOpen(true);
  }

  function openEditForm(item: SchoolClass) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      formation: item.formation,
      address: item.address,
      city: item.city,
      room: item.room,
    });
    setMessage("");
    setModalOpen(true);
  }

  function saveClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanName = form.name.trim();
    const cleanFormation = form.formation.trim();
    const cleanAddress = form.address.trim();
    const cleanCity = form.city.trim();

    if (!cleanName || !cleanFormation || !cleanAddress || !cleanCity) {
      setMessage("Merci de remplir les champs obligatoires.");
      return;
    }

    let updatedClasses: SchoolClass[];

    if (editingId) {
      updatedClasses = classes.map((item) =>
        item.id === editingId
          ? {
              ...item,
              name: cleanName,
              formation: cleanFormation,
              address: cleanAddress,
              city: cleanCity,
              room: form.room.trim(),
            }
          : item
      );
    } else {
      const newClass: SchoolClass = {
        id: `CLASS-${Date.now()}`,
        name: cleanName,
        formation: cleanFormation,
        address: cleanAddress,
        city: cleanCity,
        room: form.room.trim(),
      };

      updatedClasses = [...classes, newClass];
    }

    try {
      localStorage.setItem("school_classes", JSON.stringify(updatedClasses));
      setClasses(updatedClasses);
      setModalOpen(false);
      setMessage(
        editingId
          ? "Classe modifiée avec succès."
          : "Classe ajoutée avec succès."
      );
    } catch {
      setMessage("Erreur de sauvegarde. Réessayez.");
    }
  }

  function deleteClass(item: SchoolClass) {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer la classe "${item.name}" ?`
    );

    if (!confirmed) return;

    const updatedClasses = classes.filter(
      (current) => current.id !== item.id
    );

    try {
      localStorage.setItem("school_classes", JSON.stringify(updatedClasses));
      setClasses(updatedClasses);
      setMessage("Classe supprimée.");
    } catch {
      setMessage("Impossible de supprimer cette classe.");
    }
  }

  const filteredClasses = classes.filter((item) =>
    `${item.name} ${item.formation} ${item.address} ${item.city}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) {
    return <p className="p-8 text-slate-500">Chargement des classes...</p>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Classes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gérez les classes, les formations et leurs adresses.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Ajouter une classe
        </button>
      </div>

      {message && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total des classes</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {classes.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:col-span-2">
          <label
            htmlFor="search-classes"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Rechercher une classe
          </label>
          <input
            id="search-classes"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nom, formation, adresse ou ville..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {filteredClasses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <div className="text-4xl">🏫</div>
          <h2 className="mt-3 font-semibold text-slate-900">
            Aucune classe trouvée
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Ajoutez une classe ou modifiez votre recherche.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredClasses.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                  🎓
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Active
                </span>
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                {item.name}
              </h2>
              <p className="mt-1 text-sm font-medium text-indigo-600">
                {item.formation}
              </p>

              <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
                <p className="flex gap-2">
                  <span>📍</span>
                  <span>
                    {item.address}, {item.city}
                  </span>
                </p>

                <p className="flex gap-2">
                  <span>🚪</span>
                  <span>{item.room || "Salle non définie"}</span>
                </p>

                <p className="text-xs text-slate-400">ID : {item.id}</p>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => openEditForm(item)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Modifier
                </button>

                <button
                  type="button"
                  onClick={() => deleteClass(item)}
                  className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Supprimer
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="class-form-title"
            className="my-8 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="class-form-title"
              className="text-xl font-bold text-slate-900"
            >
              {editingId ? "Modifier la classe" : "Ajouter une classe"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Les champs marqués * sont obligatoires.
            </p>

            <form onSubmit={saveClass} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="class-name"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Nom de la classe *
                </label>
                <input
                  id="class-name"
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Ex. Français — Niveau 1"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="class-formation"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Formation / Spécialité *
                </label>
                <input
                  id="class-formation"
                  required
                  value={form.formation}
                  onChange={(event) =>
                    setForm({ ...form, formation: event.target.value })
                  }
                  placeholder="Ex. Langue française"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="class-address"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Adresse *
                </label>
                <input
                  id="class-address"
                  required
                  value={form.address}
                  onChange={(event) =>
                    setForm({ ...form, address: event.target.value })
                  }
                  placeholder="Adresse du lieu de formation"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="class-city"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Ville *
                </label>
                <input
                  id="class-city"
                  required
                  value={form.city}
                  onChange={(event) =>
                    setForm({ ...form, city: event.target.value })
                  }
                  placeholder="Ville"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="class-room"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Salle (optionnel)
                </label>
                <input
                  id="class-room"
                  value={form.room}
                  onChange={(event) =>
                    setForm({ ...form, room: event.target.value })
                  }
                  placeholder="Ex. Salle 101"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {message && (
                <p role="alert" className="text-sm text-amber-700">
                  {message}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  {editingId ? "Enregistrer" : "Ajouter la classe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}