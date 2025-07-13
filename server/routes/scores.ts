import { Router } from 'express';
import {
    submitScore,
    getTopScores,
    getUserScores
} from '../controllers/scoreController';
import { isAuthenticated } from '../middleware/isAuthenticated';

const router = Router();

router.post("/submit", isAuthenticated, submitScore );
router.get("/top", getTopScores );
router.get("/history", isAuthenticated, getUserScores );

export default router;