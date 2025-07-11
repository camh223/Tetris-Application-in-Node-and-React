import express from 'express';
import { RequestHandler } from 'express';
import {
    registerUser,
    loginUser
} from '../controllers/authController';
import {
    getMe,
    updateHighScore,
    getLeaderboard
} from '../controllers/userController';
import authenticateToken from '../middleware/authMiddleware';

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser );
router.get("/me", authenticateToken , getMe );
router.put("/update-highscore", authenticateToken , updateHighScore );
router.get("/leaderboard", getLeaderboard );

export default router;