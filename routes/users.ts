import express from 'express';
const userRouter = express.Router();
import getUserInfo from '@services/getUserInfo';
import matchFirebaseAccounts from '@services/matchFirebaseAccounts';
import validateUserId from '@services/validateUserId';
import EntityNotFoundError from '@custom_errors/EntityNotFoundError';
import syncNutrients from '@services/handleSyncing/syncNutrients';
import syncWorkouts from '@services/handleSyncing/syncWorkouts';
import syncFoodDays from '@services/handleSyncing/syncFoodDays';
import syncSavedWorkouts from '@services/handleSyncing/syncSavedWorkouts';
import syncWorkoutsInFolders from '@services/handleSyncing/syncWorkoutsInFolders';
import changeLanguage from '@services/changeLanguage';
import deleteAccount from '@services/mobile/account/deleteAccount';
import changeUsername from '@services/mobile/account/changeUsername';

userRouter.get('/', (req, res) => {
    res.json({ message: 'Users list' });
});

// Compares asyncstorage to firebase, returns emails that are missing in firebase but exist in asyncstorage
userRouter.put('/matchAccounts', async (req, res) => {

    const { asyncStorageEmails } = req.body;

    const missingAccounts = await matchFirebaseAccounts(asyncStorageEmails);

    if (!missingAccounts) {
        res.json([])
    }

    res.json(missingAccounts);
    
});

// Changes language of user in database
userRouter.put('/:userId/language', async (req, res) => {

    const userId: string = req.params.userId;
    const language = req.query.language as string;

    await validateUserId(userId);

    await changeLanguage(language, userId);
    res.status(204).send();

})

// Gets all kinds of user info (workouts, food, language, etc.)
// Currently only being used for the web app
userRouter.get('/:userId', async (req, res) => {

    const userId: string = req.params.userId;

    await validateUserId(userId);

    const userInfo = await getUserInfo(userId);

    if (!userInfo) {
        throw new EntityNotFoundError('User not found!')
    }
    
    res.json(userInfo);
    
});

// Sync user info
// Compares local info on mobile app to firebase info and fixes any missmatches
userRouter.put('/:userId', async (req, res) => {

    // TODO: add "checkUsernamesMatch" from a seperate function to here

    const userId: string = req.params.userId;

    await validateUserId(userId);

    const {
        localWorkouts = [],
        localSavedWorkouts = [],
        localFolders = [],
        localFoodDays = [],
        localNutrients = []
    } = req.body || {};

    await syncWorkouts(userId, localWorkouts);
    await syncSavedWorkouts(userId, localSavedWorkouts);
    await syncWorkoutsInFolders(userId, localFolders);
    await syncFoodDays(userId, localFoodDays);
    syncNutrients(userId, localNutrients);
    
    res.status(204).send();
})


// Deletes account assuming no sub-documents or collections exist
// Used to delete account that has yet not verified email
userRouter.delete('/:userId', async (req, res) => {

    const userId: string = req.params.userId;
    const isVerified = req.query.isVerified as string;

    await validateUserId(userId);

    await deleteAccount(userId, Boolean(isVerified));
    res.status(204).send();
})

// Changes username of user
userRouter.put('/:userId/username', async (req, res) => {

    const userId: string = req.params.userId;
    const username = req.query.username as string;
    const newUsername = req.query.newUsername as string;

    await validateUserId(userId);

    // Result returns specific message if username is taken/NSFW/too short/...
    const result = await changeUsername(username, newUsername, userId);
    res.json({message: result || 'Username successfully changed.' })

})

export default userRouter;