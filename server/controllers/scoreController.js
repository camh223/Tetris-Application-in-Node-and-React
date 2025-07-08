const Score = require("../models/Score");

exports.submitScore = async (req, res) => {
    try {
        const { username, score } = req.body;
        const newScore = await Score.create({ username, score });
        res.status(201).json(newScore);
    } catch (err) {
        res.status(500).json({ message: "Failed to submit score" });
    }
};

exports.getTopScores = async (req, res) => {
    try {
        const scores = await Score.find().sort({ score: -1 }).limit(10);
        res.json(scores);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch scores" });
    }
};