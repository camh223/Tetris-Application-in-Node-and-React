const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.getMe = async (req, res) => {
    res.json({ user: req.user });
};

exports.updateHighScore = async (req, res) => {
    const { score } = req.body;

    if (typeof score !== "number" || score < 0) {
        return res.status(400).json({ message: "Invalid score" });
    }

    try {
        const user = req.user;

        if (score > user.highScore) {
            user.highScore = score;
            await user.save();
            return res.json({ message: "High score updated.", highScore: user.highScore, isNewHighScore: true });
        }

        res.json({ message: "Score not higher than current high score", highScore: user.highScore, isNewHighScore: false });
    } catch (err) {
        console.error("Update high score error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const users = await User.find({})
            .select("username highScore")
            .sort({ highScore: -1 })
            .limit(10);
        res.json({ leaderboard: users });
    } catch (err) {
        console.error("Leaderboard error:", err);
        res.status(500).json({ message: "Server error" });
    }
};