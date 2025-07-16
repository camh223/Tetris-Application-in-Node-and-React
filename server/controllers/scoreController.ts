import { RequestHandler } from 'express';
import Score from '../models/Score';
import { IUser } from "../models/User";

export const submitScore: RequestHandler = async (req, res, next) => {
    try {
        const user = req.user as IUser;
        const { score } = req.body;

        const newScore = await Score.create({ user: user._id, score });

        if (score > user.highScore) {
            user.highScore = score;
            await user.save();
        }

        res.status(201).json({ message: "Score submitted", score: newScore });
    } catch (err) {
        next(err);
    }
};

export const getTopScores: RequestHandler = async (req, res, next) => {
    try {
        const topScores = await Score.find()
            .sort({ score: -1 })
            .limit(10)
            .populate("user", "name avatar");
        
        res.json(topScores);
    } catch (err) {
        next(err);
    }
};

export const getUserScores: RequestHandler = async (req, res, next) => {
    try {
        const user = req.user as IUser;
        const scores = await Score.find({ user: user._id }).sort({ createdAt: -1 });
        res.json(scores);
    } catch (err) {
        next(err);
    }
};