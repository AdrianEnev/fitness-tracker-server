import express from 'express';
const savedWorkoutsRouter = express.Router();
import { getSavedWorkout } from '@services/web/getSavedWorkout';
import validateUserId from '@services/validateUserId';
import EntityNotFoundError from '@custom_errors/EntityNotFoundError';

savedWorkoutsRouter.get('/', (req, res) => {
    res.json({ message: 'Saved workouts list' });
});

// Retreives info about saved workout
savedWorkoutsRouter.get('/:userId/:savedWorkoutId', async (req, res) => {

    const savedWorkoutId: string = req.params.savedWorkoutId;
    const userId: string = req.params.userId;

    await validateUserId(userId);

    const savedWorkoutInfo = await getSavedWorkout(savedWorkoutId, userId);

    if (!savedWorkoutId) {
        throw new EntityNotFoundError('Saved workout not found!')
    }

    res.json(savedWorkoutInfo);

});

export default savedWorkoutsRouter;