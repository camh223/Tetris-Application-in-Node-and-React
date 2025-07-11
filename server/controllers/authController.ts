import { Request, Response, NextFunction, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const registerUser: RequestHandler = async (req, res, next) => {
    try {
        console.log("Registering user with data:", req.body);
        const { username, password, email } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            const error = new Error("Username Taken");
            res.status(400);
            return next(error);
        }

        const hashed = await bcrypt.hash(password, 10);
        await User.create({ username, email, password: hashed });

        res.status(201).json({ message: "User registered" });
    } catch (err) {
        next(err);
    }
};

export const loginUser: RequestHandler = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error("Invalid credentials");
            res.status(400);
            return next(error);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const error = new Error("Invalid credentials");
            res.status(400);
            return next(error);
        }

        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET as string, 
            { expiresIn: "1d" }
        );

        res.json({ token,
            user: {
                id: user._id, 
                username: user.username, 
                email: user.email, 
                highScore: user.highScore 
            },
        });
    } catch (err) {
        next(err);
    }
};