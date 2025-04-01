import express from 'express';
const userRouter = express.Router();
import getUserInfo from '../services/web/getUserInfo';
import matchFirebaseAccounts from '../services/matchFirebaseAccounts';

userRouter.get('/', (req, res) => {
    res.json({ message: 'Users list' });
});

// Compares asyncstorage to firebase, returns emails that are missing in firebase but exist in asyncstorage
userRouter.put('/matchAccounts', async (req, res) => {

    const { asyncStorageEmails } = req.body;

    try {
        const missingAccounts = await matchFirebaseAccounts(asyncStorageEmails);

        if (missingAccounts) {
            //console.log('Missing accounts found, passing reuslt: ', missingAccounts)
            res.json(missingAccounts);
            res.status(200).json({ message: "Missing accounts found successfully!" });
        } else {
            //console.log('No missing accounts found, passing empty array.')
            res.json([])
            res.status(200).json({ message: "No missing accounts found, returning []!" });
        }
    } catch (error) {
        console.error('Error retrieving user info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

});

// Gets all kinds of user info (workouts, food, language, etc.)
userRouter.get('/:userId', async (req, res) => {

    const userId: string = req.params.userId;

    try {
        const userInfo = await getUserInfo(userId);

        if (userInfo) {
            res.json(userInfo);
            res.status(200).json({ message: "User info retreived successfully!" });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error retrieving user info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default userRouter;