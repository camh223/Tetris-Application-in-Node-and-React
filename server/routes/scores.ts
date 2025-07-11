import express from 'express';
import { RequestHandler } from 'express';
import authenticateToken from '../middleware/authMiddleware';
import {
    submitScore,
    getTopScores,
    getUserScores
} from '../controllers/scoreController';

const router = express.Router();

router.post("/submit", authenticateToken , submitScore );
router.get("/top", getTopScores );
router.get("/history", authenticateToken , getUserScores );

export default router;