import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String },
    summary: { type: String },
    quizQuestions: [{
        question: { type: String, required: true },
        options: { type: [String], required: true },
        correctAnswer: { type: String, required: true }
    }],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Note', noteSchema);
