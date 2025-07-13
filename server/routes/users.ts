import { Router } from "express";
import { getMe, updateHighScore, getLeaderboard } from "../controllers/userController";
import { isAuthenticated } from "../middleware/isAuthenticated";

const router = Router();

router.get("/me", isAuthenticated, getMe);
router.post("/highscore", isAuthenticated, updateHighScore);
router.get("/leaderboard", getLeaderboard);

export default router;