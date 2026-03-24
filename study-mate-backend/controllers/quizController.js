import QuizResult from '../models/QuizResult.js';
import Note from '../models/Note.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export async function submitQuiz(req, res) {
    const { answers, isFirstSubmission } = req.body;
    const noteId = req.params.noteId;
    const userId = req.user.id;

    function calculatePercentage(correct, total) {
        if (total === 0) return 0;
        return Math.round((correct / total) * 100);
    }

    if (!Array.isArray(answers) || answers.length === 0) {
        return sendError(res, 400, 'No answers submitted');
    }

    try {
        const note = await Note.findOne({ _id: noteId, userId });
        if (!note) return sendError(res, 404, "Note not found");

        let quizResult = await QuizResult.findOne({ userId, noteId });
        if (!quizResult) {
            quizResult = new QuizResult({
                userId,
                noteId,
                attemptsCount: 0,
                bestScore: 0,
                lastScore: 0,
                attemptCorrectCount: 0,
                attemptAnsweredCount: 0,
                bestAttemptCorrectCount: 0,
                bestAttemptAnsweredCount: 0,
            });
        }

        let backendCorrect = 0;
        const evaluatedAnswers = [];

        for (const ans of answers) {
            if (!ans.questionId || !ans.selectedAnswer) continue;

            const question = note.quizQuestions.find((q) => q._id.toString() === ans.questionId);
            if (!question) continue;

            const isCorrect = ans.selectedAnswer === question.correctAnswer;
            if (isCorrect) backendCorrect++;

            evaluatedAnswers.push({
                questionId: ans.questionId,
                selectedAnswer: ans.selectedAnswer,
                isCorrect,
                correctAnswer: question.correctAnswer,
            });
        }

        const answeredCount = evaluatedAnswers.length;
        let percentage = calculatePercentage(backendCorrect, answeredCount);

        if (answeredCount > 0) {
            if (isFirstSubmission) {
                quizResult.attemptsCount += 1;
                quizResult.attemptCorrectCount = 0;
                quizResult.attemptAnsweredCount = 0;
            }

            quizResult.attemptCorrectCount += backendCorrect;
            quizResult.attemptAnsweredCount += answeredCount;

            percentage = calculatePercentage(
                quizResult.attemptCorrectCount,
                quizResult.attemptAnsweredCount
            );

            quizResult.lastScore = percentage;
            const bestAnswered = quizResult.bestAttemptAnsweredCount ?? 0;
            if (
                percentage > quizResult.bestScore ||
                (percentage === quizResult.bestScore &&
                    quizResult.attemptAnsweredCount > bestAnswered)
            ) {
                quizResult.bestScore = percentage;
                quizResult.bestAttemptCorrectCount = quizResult.attemptCorrectCount;
                quizResult.bestAttemptAnsweredCount = quizResult.attemptAnsweredCount;
            }
            quizResult.updatedAt = new Date();

            await quizResult.save();
        }

        return sendSuccess(res, 200, {
            evaluatedAnswers,
            correctCount: quizResult.attemptCorrectCount,
            answeredCount: quizResult.attemptAnsweredCount,
            percentage,

            attemptsCount: quizResult.attemptsCount,
            bestScore: quizResult.bestScore,
            lastScore: quizResult.lastScore,
            updatedAt: quizResult.updatedAt ?? null,

            attemptCorrectCount: quizResult.attemptCorrectCount,
            attemptAnsweredCount: quizResult.attemptAnsweredCount,

            bestAttemptCorrectCount: quizResult.bestAttemptCorrectCount ?? 0,
            bestAttemptAnsweredCount: quizResult.bestAttemptAnsweredCount ?? 0,
        });
    } catch (err) {
        console.error("submitQuiz ERROR:", err);
        return sendError(res, 500, "Server error");
    }
}

export async function getQuizResults(req, res) {
    try {
        const results = await QuizResult
            .find({ userId: req.user.id })
            .sort({ updatedAt: -1 });

        return sendSuccess(res, 200, results);
    } catch (err) {
        return sendError(res, 500, 'Server error');
    }
}

export async function getQuizResultById(req, res) {
    try {
        const result = await QuizResult.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!result) {
            return sendError(res, 404, 'Quiz result not found');
        }

        return sendSuccess(res, 200, result);

    } catch (err) {
        return sendError(res, 500, 'Server error');
    }
}
