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
        next(err);
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
        next(err);
    }
};

exports.getUserScores = async (req, res) => {
    try {
        const scores = await Score.find({ user: req.user._id })
            .sort({ createdAt: -1 });
        
        res.json(scores);
    } catch (err) {
        next(err);
    }
};