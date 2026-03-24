import express from 'express';
import rateLimit from 'express-rate-limit';
import auth from '../middleware/auth.js';
import { generateNoteFromText, generateQuiz } from '../controllers/aiController.js';

const router = express.Router();

const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Túl sok AI kérés rövid időn belül. Kérlek próbáld meg később.' }
});

router.post('/generate', auth, aiLimiter, generateNoteFromText);
router.post('/quiz', auth, aiLimiter, generateQuiz);

export default router;
