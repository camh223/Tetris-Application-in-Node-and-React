const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const { 
    submitScore, 
    getTopScores,
    getUserScores,
} = require("../controllers/scoreController");

router.post("/submit", authenticateToken, submitScore);
router.get("/top", getTopScores);
router.get("/history", authenticateToken, getUserScores);

module.exports = router;