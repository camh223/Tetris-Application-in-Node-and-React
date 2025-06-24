const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

console.log("Auth routes loaded");

router.post('/register', async (req, res) => {
    console.log("POST /api/auth/register hit");
    const { username, email, password } = req.body;
    
    if (!username || !email || !password)
        return res.status(400).json({ message: 'Missing fields'});

    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists)
        return res.status(409).json({ message: 'Username or email already exists'});

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
});

router.post('/login', async (req, res) => {
    console.log("Received registration request");
    console.log("Request body:", req.body);
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id:user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { username: user.username, email: user.email, highScore: user.highScore } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;