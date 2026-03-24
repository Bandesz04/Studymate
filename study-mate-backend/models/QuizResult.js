import mongoose from 'mongoose';

const quizResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },

    attemptsCount: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },

    lastScore: { type: Number, default: 0 },

    attemptCorrectCount: { type: Number, default: 0 },
    attemptAnsweredCount: { type: Number, default: 0 },

    bestAttemptCorrectCount: { type: Number, default: 0 },
    bestAttemptAnsweredCount: { type: Number, default: 0 },

    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('QuizResult', quizResultSchema);