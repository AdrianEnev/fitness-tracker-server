import express from 'express';
const savedWorkoutsRouter = express.Router();
import { getSavedWorkout } from '@services/web/getSavedWorkout';
import validateUserId from '@services/validateUserId';
import EntityNotFoundError from '@custom_errors/EntityNotFoundError';
import deleteSavedWorkout from '@services/mobile/savedWorkouts/deleteSavedWorkout';
import endWorkout from '@services/mobile/workouts/endWorkout';

savedWorkoutsRouter.get('/', (req, res) => {
    res.json({ message: 'Saved workouts list' });
});

// End workout -> runs when user ends workouts
// Used to save workout to firebase
savedWorkoutsRouter.post('/:userId/endWorkout', async (req, res) => {

    const userId: string = req.params.userId;
    await validateUserId(userId);

    const { workoutData } = req.body || {};

    await endWorkout(workoutData, userId);
    res.status(204).send();

})

// Retreives info about saved workout
savedWorkoutsRouter.get('/:userId/:savedWorkoutId', async (req, res) => {

    const userId: string = req.params.userId;
    await validateUserId(userId);

    const savedWorkoutId: string = req.params.savedWorkoutId;
    const savedWorkoutInfo = await getSavedWorkout(savedWorkoutId, userId);

    if (!savedWorkoutId) {
        throw new EntityNotFoundError('Saved workout not found!')
    }

    res.json(savedWorkoutInfo);

});

// Deletes saved workout
savedWorkoutsRouter.delete('/:userId/:savedWorkoutId', async (req, res) => {

    const userId: string = req.params.userId;
    await validateUserId(userId);

    const savedWorkoutId: string = req.params.savedWorkoutId;

    await deleteSavedWorkout(savedWorkoutId, userId);
    res.status(204).send();

});

export default savedWorkoutsRouter;