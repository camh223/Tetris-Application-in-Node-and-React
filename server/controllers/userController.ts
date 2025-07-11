import { Response, NextFunction, RequestHandler } from 'express';
import User from '../models/User';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

export const getMe: RequestHandler = async (req, res, next) => {
    const authReq = req as AuthenticatedRequest;
    try {
        res.json({ user: authReq.user });
    } catch (err) {
        next(err);
    }
};

export const updateHighScore: RequestHandler = async (req, res, next) => {
    const authReq = req as AuthenticatedRequest;
    const { score } = req.body;

    if (typeof score !== "number" || score < 0) {
        const error = new Error("Invalid score");
        res.status(400);
        return next(error);
    }

    try {
        const user = authReq.user;

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

export const getLeaderboard: RequestHandler = async (req, res, next) => {
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