import React, { useEffect, useMemo, useState } from "react";
import { FiCheck, FiX, FiRefreshCw } from "react-icons/fi";
import { useApi } from "../hooks/useApi";

const Quiz = ({ noteId, questions, initialCount = 5, questionsPerBatch = 3 }) => {
  const api = useApi();
  const [displayedQuestions, setDisplayedQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [evaluated, setEvaluated] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [quizStats, setQuizStats] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const toKey = (id) => (id?.toString?.() ?? id);

  useEffect(() => {
    if (questions?.length) setDisplayedQuestions(questions.slice(0, initialCount));
  }, [questions, initialCount]);

  useEffect(() => {
    setHasSubmitted(false);
    setSelectedAnswers({});
    setEvaluated({});
    setCorrectAnswers({});
    setQuizStats(null);
  }, [noteId]);

  const pendingQuestions = useMemo(() => {
    return displayedQuestions.filter((q) => !(toKey(q._id) in evaluated));
  }, [displayedQuestions, evaluated]);

  const allAnswered = pendingQuestions.every((q) => selectedAnswers[toKey(q._id)]);
  const hasPending = pendingQuestions.length > 0;

  const handleSelect = (questionId, option) => {
    const qKey = toKey(questionId);
    if (qKey in evaluated) return;
    setSelectedAnswers((prev) => ({ ...prev, [qKey]: option }));
  };

  const handleSubmitQuiz = async () => {
    if (!hasPending) return;
    if (!allAnswered) return;

    const answersPayload = pendingQuestions.map((q) => ({
      questionId: toKey(q._id),
      selectedAnswer: selectedAnswers[toKey(q._id)],
    }));

    setSubmitting(true);
    try {
      const res = await api(`/api/quiz/${noteId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answersPayload,
          isFirstSubmission: !hasSubmitted,
        }),
      });

      if (!res.ok) throw new Error("Quiz submit failed");

      const json = await res.json();
      const result = json.data ?? json;

      const nextEvaluated = { ...evaluated };
      const nextCorrectAnswers = { ...correctAnswers };

      (result.evaluatedAnswers || []).forEach((a) => {
        const qId = toKey(a.questionId);
        if (!qId) return;
        nextEvaluated[qId] = a.isCorrect;
        if (a.correctAnswer !== undefined) nextCorrectAnswers[qId] = a.correctAnswer;
      });

      setEvaluated(nextEvaluated);
      setCorrectAnswers(nextCorrectAnswers);
      setQuizStats({
        attemptsCount: result.attemptsCount ?? 0,
        bestScore: result.bestScore ?? 0,
        bestAttemptCorrectCount: result.bestAttemptCorrectCount ?? 0,
        bestAttemptAnsweredCount: result.bestAttemptAnsweredCount ?? 0,
        lastScore: result.lastScore ?? 0,
        updatedAt: result.updatedAt ?? null,
      });

      setHasSubmitted(true);
    } catch (err) {
      console.error("Quiz submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestions = () => {
    const currentLength = displayedQuestions.length;
    const nextBatch = questions.slice(currentLength, currentLength + questionsPerBatch);
    if (nextBatch.length) setDisplayedQuestions((prev) => [...prev, ...nextBatch]);
  };

  const evaluatedDisplayed = displayedQuestions.filter((q) => toKey(q._id) in evaluated);
  const correctDisplayedCount = evaluatedDisplayed.filter((q) => evaluated[toKey(q._id)]).length;
  const displayedPercentage =
    evaluatedDisplayed.length > 0 ? Math.round((correctDisplayedCount / evaluatedDisplayed.length) * 100) : null;

  const getOptionClass = (questionId, option) => {
    const qKey = toKey(questionId);
    const isSelected = selectedAnswers[qKey] === option;
    const isEvaluated = qKey in evaluated;
    const correctAnswer = correctAnswers[qKey];

    if (!isEvaluated) {
      return isSelected
        ? "border-orange-600 dark:border-green-400"
        : "border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800";
    }

    if (correctAnswer && option === correctAnswer) {
      return "border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-900/20";
    }

    if (isSelected && !evaluated[qKey]) {
      return "border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-900/20";
    }

    return "opacity-60";
  };

  if (!questions?.length) return null;

  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <h2 className="text-2xl font-bold mb-8 text-orange-600 dark:text-green-400">Kvíz</h2>

      {displayedQuestions.map((q, idx) => {
        const qKey = toKey(q._id);
        const isEvaluated = qKey in evaluated;
        const selected = selectedAnswers[qKey];
        const correctAnswer = correctAnswers[qKey];

        return (
          <div key={q._id} className="mb-10">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">
              <span className="text-orange-600 dark:text-green-400 mr-2">{idx + 1}.</span>
              {q.question}
            </h3>

            {q.options.map((opt, i) => (
              <div
                key={i}
                onClick={() => handleSelect(q._id, opt)}
                className={`p-4 border-2 rounded-xl mb-2 transition text-gray-900 dark:text-gray-100 ${
                  isEvaluated ? "select-none" : "cursor-pointer"
                } ${getOptionClass(q._id, opt)}`}
              >
                {opt}
              </div>
            ))}

            {isEvaluated && (
              <div className="mt-3 text-sm">
                {evaluated[qKey] ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                    <FiCheck /> Helyes
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 text-red-700 dark:text-red-400 font-medium">
                    <div className="flex items-center gap-2">
                      <FiX /> Helytelen
                    </div>
                    {correctAnswer && (
                      <div className="text-gray-600 dark:text-gray-300 font-normal">
                        Helyes válasz: <span className="font-medium">{correctAnswer}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={handleSubmitQuiz}
          disabled={!allAnswered || submitting || !hasPending}
          className="px-8 py-3 bg-orange-600 text-white rounded-xl transition-colors disabled:opacity-60 disabled:cursor-default enabled:cursor-pointer enabled:hover:bg-orange-700 dark:bg-green-600 dark:enabled:hover:bg-green-700"
        >
          {submitting ? "Kiértékelés..." : "Kvíz kiértékelése"}
        </button>

        {displayedPercentage !== null && (
          <div className="text-sm text-gray-800 dark:text-gray-100">
            <span className="font-semibold">
              <span className="text-orange-600 dark:text-green-400">Eredmény:</span>{" "}
              <span>{displayedPercentage}%</span>{" "}
              <span className="text-gray-600 dark:text-gray-300 font-normal">
                ({correctDisplayedCount}/{evaluatedDisplayed.length} helyes)
              </span>
            </span>
            {quizStats && (
              <span className="ml-3 text-gray-600 dark:text-gray-300 font-normal">
                Próbálkozások: {quizStats.attemptsCount}, Legjobb: {quizStats.bestScore}%{" "}
                {quizStats.bestAttemptAnsweredCount > 0
                  ? `(${quizStats.bestAttemptCorrectCount}/${quizStats.bestAttemptAnsweredCount})`
                  : ""}
              </span>
            )}
          </div>
        )}
      </div>

      {displayedQuestions.length < questions.length && (
        <button
          onClick={handleNextQuestions}
          className="mt-4 flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-green-400 transition-colors cursor-pointer"
        >
          <FiRefreshCw /> Következő kérdések
        </button>
      )}
    </div>
  );
};

export default Quiz;
