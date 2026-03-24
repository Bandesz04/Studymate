import express from 'express';
import auth from '../middleware/auth.js';
import { submitQuiz, getQuizResults, getQuizResultById } from '../controllers/quizController.js';

const router = express.Router();

router.post('/:noteId/submit', auth, submitQuiz);
router.get('/results', auth, getQuizResults);
router.get('/:id', auth, getQuizResultById);

export default router;
