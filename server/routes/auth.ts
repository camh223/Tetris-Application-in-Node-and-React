import { Router } from "express";
import passport from "passport";
import { getCurrentUser, logoutUser } from "../controllers/authController";

const router = Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: "http://localhost:3000/login",
        session: true
    }),
    (_req, res) => {
        res.redirect("http://localhost:3000/dashboard");
    }
);

router.get("/me", getCurrentUser);

router.get("/logout", logoutUser);

export default router;