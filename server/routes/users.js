const express = require('express');
const router = express.Router();
const {
    getMe,
    updateHighScore,
    getLeaderboard,
} = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/me", authenticateToken, getMe);
router.put("/update-highscore", authenticateToken, updateHighScore);
router.get("/leaderboard", getLeaderboard);

module.exports = router;