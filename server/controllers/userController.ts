const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.getMe = async (req, res) => {
    try {
        res.json({ user: req.user });
    } catch (err) {
        next(err);
    }
};

exports.updateHighScore = async (req, res) => {
    const { score } = req.body;

    if (typeof score !== "number" || score < 0) {
        const error = new Error("Invalid score");
        res.status(400);
        return next(error);
    }

    try {
        const user = req.user;

        if (score > user.highScore) {
            user.highScore = score;
            await user.save();
            return res.json({ 
                message: "High score updated.", 
                highScore: user.highScore, 
                isNewHighScore: true 
            });
        }

        res.json({ 
            message: "Score not higher than current high score", 
            highScore: user.highScore, 
            isNewHighScore: false 
        });
    } catch (err) {
        next(err);
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
        next(err);
    }
};