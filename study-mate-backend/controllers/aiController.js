import Note from '../models/Note.js';
import { callGeminiWithRetry, AIResponseError } from '../ai/aiRetry.js';
import { QUIZ_CONFIG } from '../config/quizConfig.js';

function cleanInputText(text) {
    if (!text) return '';
    return text
        .replace(/\u0000/g, '')
        .replace(/<[^>]*>/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

function isValidSummaryPayload(data, minWords) {
    if (!data || typeof data !== 'object') return false;
    if (typeof data.title !== 'string' || !data.title.trim()) return false;
    if (typeof data.summary !== 'string') return false;

    const words = data.summary.split(/\s+/).length;
    return words >= minWords;
}

function isValidQuizPayload(data, expectedCount) {
    if (!Array.isArray(data) || data.length !== expectedCount) return false;

    return data.every(q =>
        typeof q.question === 'string' &&
        q.question.trim().length > 0 &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.options.every(o => typeof o === 'string') &&
        typeof q.correctAnswer === 'string' &&
        q.options.includes(q.correctAnswer)
    );
}

export async function generateNoteFromText(req, res) {
    try {
        const { content, summaryLength } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                error: 'Nincs szöveg'
            });
        }

        const cleaned = cleanInputText(content);
        const wordCount = cleaned.split(/\s+/).length;

        const percent =
            summaryLength === 'short' ? 25 :
                summaryLength === 'medium' ? 45 :
                    summaryLength === 'long' ? 70 : 40;

        const targetWords = Math.max(120, Math.floor(wordCount * percent / 100));
        const minWords = Math.floor(targetWords * 0.85);
        const maxWords = Math.floor(targetWords * 1.15);

        const prompt = `
Adj vissza kizárólag érvényes JSON-t:

{
  "title": "4-10 szavas cím",
  "summary": "összefoglaló"
}

SZABÁLYOK:
- ${minWords}–${maxWords} szó
- Ne ismételj
- Ne írj semmit a JSON elé vagy mögé

SZÖVEG:
${cleaned}
`;

        let data;
        try {
            data = await callGeminiWithRetry(prompt);
        } catch (err) {
            if (err instanceof AIResponseError) {
                return res.status(502).json({
                    success: false,
                    error: err.message
                });
            }
            throw err;
        }

        if (!isValidSummaryPayload(data, minWords)) {
            return res.status(500).json({
                success: false,
                error: 'AI strukturálisan hibás summary választ adott'
            });
        }

        const note = new Note({
            userId: req.user.id,
            title: data.title,
            content: cleaned,
            summary: data.summary
        });

        await note.save();
        res.status(201).json({
            success: true,
            data: note
        });

    } catch (err) {
        console.error('generateNoteFromText ERROR:', err);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
}

export async function generateQuiz(req, res) {
    try {
        const note = await Note.findOne({
            _id: req.body.noteId,
            userId: req.user.id
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                error: 'Note not found'
            });
        }

        const summary = cleanInputText(note.summary);

        const estimated = Math.floor(summary.split(/\s+/).length / QUIZ_CONFIG.WORDS_PER_QUESTION);
        const questionCount = Math.min(
            QUIZ_CONFIG.MAX_QUESTIONS,
            Math.max(QUIZ_CONFIG.MIN_QUESTIONS, estimated)
        );

        const prompt = `
Adj vissza kizárólag JSON listát:

[
  { "question": "...", "options": ["A","B","C","D"], "correctAnswer": "A" }
]

SZABÁLYOK:
- Pontosan ${questionCount} kérdés
- Csak a SUMMARY-ből dolgozz
- Ne írj extra szöveget

SUMMARY:
${summary}
`;

        let data;
        try {
            data = await callGeminiWithRetry(prompt);
        } catch (err) {
            if (err instanceof AIResponseError) {
                return res.status(500).json({
                    success: false,
                    error: 'Server error'
                });
            }
            throw err;
        }

        if (!isValidQuizPayload(data, questionCount)) {
            return res.status(500).json({
                success: false,
                error: 'AI strukturálisan hibás kérdéssort adott'
            });
        }

        note.quizQuestions = data;
        await note.save();

        res.json({
            success: true,
            data: { quizQuestions: data }
        });

    } catch (err) {
        console.error('generateQuiz ERROR:', err);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
}
