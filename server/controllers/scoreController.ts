import { Request, Response, NextFunction, RequestHandler } from 'express';
import Score from '../models/Score';
import User from '../models/User';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

export const submitScore: RequestHandler = async (req, res, next) => {
    const authReq = req as AuthenticatedRequest;
    try {
        const { score } = req.body;
        const userId = authReq.user._id;

        const newScore = await Score.create({ user: userId, score });

        const user = await User.findById(userId);
        if (user && score > user.highScore) {
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
            .populate("user", "username");
        
        res.json(topScores);
    } catch (err) {
        next(err);
    }
};

export const getUserScores: RequestHandler = async (req, res, next) => {
    const authReq = req as AuthenticatedRequest;
    try {
        const scores = await Score.find({ user: authReq.user._id }).sort({ createdAt: -1 });
        res.json(scores);
    } catch (err) {
        next(err);
    }
};