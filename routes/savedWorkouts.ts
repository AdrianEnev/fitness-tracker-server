import express from 'express';
const savedWorkoutsRouter = express.Router();
import { getSavedWorkout } from '../services/web/getSavedWorkout';

savedWorkoutsRouter.get('/', (req, res) => {
    res.json({ message: 'Saved workouts list' });
});

// Retreives info about saved workout
savedWorkoutsRouter.get('/:userId/:savedWorkoutId', async (req, res) => {

    const savedWorkoutId: string = req.params.savedWorkoutId;
    const userId: string = req.params.userId;

    try {
        const savedWorkoutInfo = await getSavedWorkout(savedWorkoutId, userId);

        if (savedWorkoutInfo) {
            res.json(savedWorkoutInfo);
            res.status(200).json({ message: "Saved workout retreived successfully!" });
        } else {
            res.status(404).json({ error: 'Saved workout not found' });
        }
    } catch (error) {
        console.error('Error retrieving saved workout:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

});

export default savedWorkoutsRouter;