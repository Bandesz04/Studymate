import React, { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";

const MainPage = () => {
  const navigate = useNavigate();
  const api = useApi();

  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [summaryLength, setSummaryLength] = useState("short");
  const [isQuizEnabled, setIsQuizEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
        alert("Kérlek adj meg egy témát vagy szöveget!");
        return;
    }

    const wordCount = topic.trim().split(/\s+/).length;
    if (wordCount < 50) {
        alert("A megadott szöveg túl rövid. Kérlek adj meg legalább 50 szót!");
        return;
    }

    setLoading(true);

    try {
        const aiRes = await api("/api/ai/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content: topic,
            summaryLength,
        }),
        });

        const data = await aiRes.json();

        if (!aiRes.ok) {
        throw new Error(data.error || "Hiba a jegyzet generálás során");
        }

        const newNote = data.data ?? data;

        if (isQuizEnabled) {
        const quizRes = await api("/api/ai/quiz", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            noteId: newNote._id,
            }),
        });

        if (!quizRes.ok) {
            const errData = await quizRes.json();
            console.error("Hiba a kvíz generálás során:", errData);
        }
        }

        navigate(`/notes/${newNote._id}`, {
        state: { questionCount },
        });

    } catch (err) {
        console.error(err);
        alert(err.message);
    } finally {
        setLoading(false);
    }
    };

  return (
    <div className="min-h-[60vh] bg-gray-50 dark:bg-gray-950 flex flex-col text-gray-900 dark:text-gray-100 relative">

      {loading && (
        <div className="fixed inset-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 dark:border-green-200 dark:border-t-green-400 rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            StudyMate jegyzet generálása...
          </h2>
          <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">
            Ez eltarthat pár másodpercig.
          </p>
        </div>
      )}

      <main className="flex grow items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-orange-600 dark:text-green-400 mb-2">
              Üdvözöl a StudyMate
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Az AI alapú tanulótársad.</p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                Téma vagy szöveg
              </label>
              <textarea
                rows="10"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Másold be a szöveget, amiből jegyzetet szeretnél..."
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded h-56 resize-none focus:outline-none focus:border-orange-500 dark:focus:border-green-400 transition-colors bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              ></textarea>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isQuizEnabled}
                    onChange={(e) => setIsQuizEnabled(e.target.checked)}
                      className="accent-orange-600 dark:accent-green-400 w-4 h-4 cursor-pointer"
                  />
                    <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">
                    Kvízt is kérek
                  </span>
                </label>

                <select
                  value={summaryLength}
                  onChange={(e) => setSummaryLength(e.target.value)}
                  className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-100 text-sm rounded p-1.5 bg-white dark:bg-gray-950 cursor-pointer focus:outline-none focus:border-orange-500 dark:focus:border-green-400"
                >
                  <option value="short">Rövid</option>
                  <option value="medium">Közepes</option>
                  <option value="long">Hosszú</option>
                </select>

                {isQuizEnabled && (
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-100 text-sm rounded p-1.5 bg-white dark:bg-gray-950 cursor-pointer focus:outline-none focus:border-orange-500 dark:focus:border-green-400"
                  >
                    <option value="3">3 kérdés</option>
                    <option value="5">5 kérdés</option>
                    <option value="10">10 kérdés</option>
                  </select>
                )}
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center px-6 py-2 bg-orange-600 hover:bg-orange-700 dark:bg-green-600 dark:hover:bg-green-700 text-white font-medium rounded shadow-sm hover:shadow-md transition-colors disabled:opacity-50"
              >
                <FiPlus className="mr-2" /> Jegyzet generálása
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainPage;
