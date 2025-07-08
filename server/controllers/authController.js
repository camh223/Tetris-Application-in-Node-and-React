const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.registerUser = async (req, res) => {
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
        const newUser = await User.create({ username, email, password: hashed });

        res.status(201).json({ message: "User registered" });
    } catch (err) {
        next(err);
    }
};

exports.loginUser = async (req, res) => {
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

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.json({ token, user: {id: user._id, username: user.username, email: user.email, highScore: user.highScore } });
    } catch (err) {
        next(err);
    }
};