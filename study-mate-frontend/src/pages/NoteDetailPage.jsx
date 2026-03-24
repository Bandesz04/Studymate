import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Quiz from "../components/Quiz";
import { useApi } from "../hooks/useApi";

const NoteDetailPage = () => {
  const api = useApi();
  const { id } = useParams();
  const location = useLocation();
  const questionCount = location.state?.questionCount || 5;

  const [note, setNote] = useState(null);
  const [showSummary, setShowSummary] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api(`/api/notes/${id}`, {
          method: "GET",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Hiba a jegyzet lekérésekor");
        }

        setNote(data.data ?? data);
      } catch (err) {
        console.error(err);
        setNote(null);
        setError(err.message || "Hiba a jegyzet lekérésekor");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, api]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="p-6 text-center text-gray-500 dark:text-gray-300">Betöltés...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-orange-600 dark:text-green-400 mb-2">
            A jegyzet nem található
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <Link
            to="/notes"
            className="inline-flex px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 transition-colors"
          >
            Vissza a jegyzetekhez
          </Link>
        </div>
      </div>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-50 dark:bg-gray-950 flex flex-col text-gray-900 dark:text-gray-100">
      <main className="grow p-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-orange-600 dark:text-green-400">
                {note.title}
              </h2>
              <button
                onClick={() => setShowSummary(!showSummary)}
                className="px-3 py-2 bg-gray-50 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm text-gray-800 dark:text-gray-100 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
              >
                {showSummary ? "Jegyzet elrejtése" : "Jegyzet megjelenítése"}
              </button>
            </div>

            {showSummary && (
              <p className="text-gray-600 dark:text-gray-300 text-lg whitespace-pre-line">
                {note.summary}
              </p>
            )}
          </div>

          {note.quizQuestions?.length > 0 && (
            <Quiz noteId={note._id} questions={note.quizQuestions} initialCount={questionCount} />
          )}
        </div>
      </main>
    </div>
  );
};

export default NoteDetailPage;
