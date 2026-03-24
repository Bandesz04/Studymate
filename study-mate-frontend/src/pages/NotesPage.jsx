import React, { useEffect, useState } from "react";
import { FiArrowRight, FiTrash2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";

const NotesPage = () => {
  const api = useApi();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const res = await api("/api/notes", { method: "GET" });
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Nem sikerült betölteni a jegyzeteket");
        }

        setNotes(json.data ?? []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, [api]);

  const handleDelete = async (id) => {
    if (!window.confirm("Biztosan törlöd a jegyzetet?")) return;

    try {
      const res = await api(`/api/notes/${id}`, { method: "DELETE" });

      if (!res.ok) {
        throw new Error("Hiba történt a törlés során");
      }

      setNotes((prev) => prev.filter((note) => note._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="p-6 text-gray-600 dark:text-gray-300">Jegyzetek betöltése...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="p-6 text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col">
      <main className="grow p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-orange-600 dark:text-green-400 mb-6">
            Előző jegyzetek
          </h2>

          {notes.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Még nincsenek jegyzeteid.</p>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note._id} className="flex items-center gap-3 group">
                  <button
                    onClick={() => handleDelete(note._id)}
                    className="p-3 text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800 shrink-0"
                    title="Törlés"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>

                  <Link
                    to={`/notes/${note._id}`}
                    className="grow bg-white dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                        {note.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(note.createdAt).toLocaleDateString("hu-HU")}
                      </p>
                    </div>
                    <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 dark:text-gray-500" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NotesPage;
