import express from 'express';
import dotenv from 'dotenv';
import userRouter from './routes/users';
import workoutsRouter from './routes/workouts';
import foodDaysRouter from './routes/foodDays';
import savedWorkoutsRouter from './routes/savedWorkouts';
import modelsRouter from './routes/models';
import stripeRouter from './routes/stripe';

const app = express();
app.use(express.json());
dotenv.config();

const PORT = process.env.BACKEND_PORT || 3000;

app.get('/api', (req, res) => {
    res.json({ message: 'API Working' });
});

// Basic functions
app.use('/api/users', userRouter);
app.use('/api/workouts', workoutsRouter);
app.use('/api/savedWorkouts', savedWorkoutsRouter);
app.use('/api/foodDays', foodDaysRouter);
app.use('/api/stripe', stripeRouter);

// AI models
app.use('/api/models', modelsRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});