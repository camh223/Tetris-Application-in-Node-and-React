const Score = require("../models/Score");
const User = require("../models/User");

exports.submitScore = async (req, res) => {
    try {
        const { score } = req.body;
        const userId = req.user._id;

        const newScore = await Score.create({ user: userId, score });

        const user = await User.findById(userId);
        if (score > user.highScore) {
            user.highScore = score;
            await user.save();
        }
        res.status(201).json({ message: "Score submitted", score: newScore });
    } catch (err) {
        console.error("Submit score error:", err);
        res.status(500).json({ message: "Failed to submit score" });
    }
};

exports.getTopScores = async (req, res) => {
    try {
        const topScores = await Score.find()
            .sort({ score: -1 })
            .limit(10)
            .populate("user", "username");
        
        res.json(topScores);
    } catch (err) {
        console.error("Get top scores error:", err);
        res.status(500).json({ message: "Failed to fetch scores" });
    }
};

exports.getUserScores = async (req, res) => {
    try {
        const scores = await Score.find({ user: req.user._id })
            .sort({ createdAt: -1 });
        
        res.json(scores);
    } catch (err) {
        console.error("Get user scores error:", err);
        res.status(500).json({ message: "Failed to fetch user scores" })
    }
};