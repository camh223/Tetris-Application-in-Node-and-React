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
    console.log("Request Headers:", req.headers);
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

router.get('/me', async (req, res) => {
    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorizaiton header missing or malformed'});
    }

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ user });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

router.put('/update-highscore', async (req, res) => {
    console.log("PUT /api/auth/update-highscore hit");
    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization header missing or malformed'});
    }

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const { score } = req.body;
    if (typeof score !== 'number' || score < 0) {
        return res.status(400).json({ message: 'Invalid score' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Only update if the new score is higher than the current high score
        if (score > user.highScore) {
            user.highScore = score;
            await user.save();
            res.json({ 
                message: 'High score updated!', 
                highScore: user.highScore,
                isNewHighScore: true
            });
        } else {
            res.json({ 
                message: 'Score not higher than current high score', 
                highScore: user.highScore,
                isNewHighScore: false
            });
        }
    } catch (err) {
        console.error('Update high score error:', err);
        res.status(401).json({ message: 'Invalid token' });
    }
});

router.get('/leaderboard', async (req, res) => {
    console.log("GET /api/auth/leaderboard hit");
    try {
        // Get all users sorted by high score in descending order
        // Only return username and high score for privacy
        const users = await User.find({})
            .select('username highScore')
            .sort({ highScore: -1 })
            .limit(10); // Limit to top 10 players

        res.json({ leaderboard: users });
    } catch (err) {
        console.error('Leaderboard error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;