const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

const authRoutes = require('./routes/auth');
const scoreRoutes = require('./routes/scores');

app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => 
        console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
}).catch((err) => console.log('MongoDB connection error:', err));