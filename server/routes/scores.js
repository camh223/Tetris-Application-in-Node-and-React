const express = require("express");
const router = express.Router();
const { submitScore, getTopScores } = require("../controllers/scoreController");

router.post("/", submitScore);
router.get("/", getTopScores);

module.exports = router;