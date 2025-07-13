import { Request, Response, } from 'express';

export const getCurrentUser = (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
    } else {
        res.status(401).json({ message: "Not authenticated" });
    }
};

export const logoutUser = (req: Request, res: Response) => {
    req.logout(() => {
        res.status(200).json({ message: "Logged out successfully" });
    });
};

