import express from 'express';
const workoutsRouter = express.Router();
import { getWorkout } from '@services/web/getWorkout';
import getWorkouts from '@services/mobile/workouts/getWorkouts';
import syncWorkouts from '@services/handleSyncing/syncWorkouts';
import { deleteWorkouts } from '@services/mobile/workouts/deleteWorkouts';
import addWorkout from '@services/mobile/workouts/addWorkout';
import EntityNotFoundError from '@custom_errors/EntityNotFoundError';
import validateUserId from '@services/validateUserId';

// Gets a snapshot of workout documents. Effective for updates but not for displaying info
workoutsRouter.get("/:userId", async (req, res) => {

    const userId: string = req.params.userId;
  
    // Throws bad request error if ID is invalid
    await validateUserId(userId);
    
    const workouts = await getWorkouts(userId);

    if (!workouts) {
        throw new EntityNotFoundError('Could not retreive workout snapshots');
    }
  
    res.json(workouts);

});

// Retreive single workout (user id -> workout id)
workoutsRouter.get('/:userId/:workoutId', async (req, res) => {

    const workoutId: string = req.params.workoutId;
    const userId: string = req.params.userId;

    // Throws bad request error if ID is invalid
    await validateUserId(userId);

    const workoutInfo = await getWorkout(workoutId, userId);

    if (!workoutInfo) {
        throw new EntityNotFoundError('Could not retreive info about workout');
    }

    res.json(workoutInfo);
    
});

// Sync workouts -> compare user Id firebase workouts to provided asyncstorage workouts and add any missing ones to firebase
/*workoutsRouter.put('/:userId', async (req, res) => {

    const { parsedLocalWorkouts } = req.body;
    const userId = req.params.userId;

    // Throws bad request error if ID is invalid
    await validateUserId(userId);

    await syncWorkouts(userId, parsedLocalWorkouts);
    res.status(204).send();

});*/

// Create/Add workout (user id)
workoutsRouter.post('/:userId', async (req, res) => {

    const { 
        language,
        exercises,
        workoutTitle,
        workoutId,
        folder
    } = req.body;

    const userId: string = req.params.userId;

    await validateUserId(userId);

    await addWorkout(userId, language, exercises, workoutTitle, workoutId, folder);
    res.status(204).send();
    
});

// Can be used to delete 1 or more workouts at a time
workoutsRouter.delete('/:userId', async (req, res) => {
    
    const userId: string = req.params.userId;
    await validateUserId(userId);

    const { workouts } = req.body;
    
    await deleteWorkouts(workouts, userId);
    res.status(204).send();

});

export default workoutsRouter;