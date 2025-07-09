const express = require('express');
const errorHandler = require("./middleware/errorHandler");
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
const userRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/users', userRoutes);
app.use(errorHandler);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => 
        console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
}).catch((err) => console.log('MongoDB connection error:', err));

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}