import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
    status?: number;
}

const errorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error("Error:", err);

    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode);

    res.json({
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};

export default errorHandler;