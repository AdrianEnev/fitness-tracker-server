import express from 'express';
const workoutsRouter = express.Router();
import { getWorkout } from '../services/web/getWorkout';
import getWorkouts from '../services/mobile/workouts/getWorkouts';
import syncWorkouts from '../services/mobile/workouts/syncWorkouts';

// Get all workouts (user id)
workoutsRouter.get('/:userId', async (req, res) => {
    
    const userId: string = req.params.userId;

    try {
        const workouts = await getWorkouts(userId);

        if (workouts) {
            res.json(workouts);
        } else {
            res.status(404).json({ error: 'Workouts not found' });
        }
    } catch (error) {
        console.error('Error retrieving workouts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

});

// Sync workouts -> compare user Id firebase workouts to provided asyncstorage workouts and add any missing ones to firebase
workoutsRouter.put('/:userId', async (req, res) => {

    const { parsedLocalWorkouts } = req.body;
    const userId = req.params.userId;

    try {
        await syncWorkouts(userId, parsedLocalWorkouts);
    } catch (error) {
        console.error('Error retrieving workouts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

});

// Create/Add workout (user id)
workoutsRouter.post('/:userId', (req, res) => {
    res.json({ message: 'Create workout' });
});

// Delete workout (user id -> workout id)
workoutsRouter.delete('/:userId/:workoutId', (req, res) => {
    res.json({ message: 'Delete workout' });
});

// Retreive single workout (user id -> workout id)
workoutsRouter.get('/:userId/:workoutId', async (req, res) => {

    const workoutId: string = req.params.workoutId;
    const userId: string = req.params.userId;

    try {
        const workoutInfo = await getWorkout(workoutId, userId);

        if (workoutInfo) {
            res.json(workoutInfo);
        } else {
            res.status(404).json({ error: 'Workout not found' });
        }
    } catch (error) {
        console.error('Error retrieving workout:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

});

export default workoutsRouter;