import express, { Application } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import errorHandler from './middleware/errorHandler';

import authRoutes from './routes/auth';
import scoreRoutes from './routes/scores';

dotenv.config();

const app: Application = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);
app.use(errorHandler);

const PORT: number = parseInt(process.env.PORT || '5000', 10);

mongoose.connect(process.env.MONGO_URI as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true
} as mongoose.ConnectOptions)
.then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => 
        console.log(`Server running on port ${PORT}`)
    );
})
.catch((err) => console.log('MongoDB connection error:', err));