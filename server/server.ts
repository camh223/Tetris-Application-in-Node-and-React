import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import authRoutes from "./routes/auth";
import scoresRoutes from "./routes/scores";
import usersRoutes from "./routes/users";
import "./config/passport";
import errorHandler from "./middleware/errorHandler";

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));

app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET!,
        resave: false,
        saveUninitialized: true,
        cookie: {
            httpOnly: true,
            secure: false,
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/scores", scoresRoutes);
app.use("/api/users", usersRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});