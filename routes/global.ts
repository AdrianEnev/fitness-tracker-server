import matchFirebaseAccounts from '@services/matchFirebaseAccounts';
import express from 'express';
const globalRouter = express.Router();

globalRouter.get('/', (req, res) => {
    res.json({ message: 'Global router used to access database without the need to provide a specific user' });
});

// Compares asyncstorage to firebase, returns emails that are missing in firebase but exist in asyncstorage
globalRouter.put('/matchAccounts', async (req, res) => {

    const { asyncStorageEmails } = req.body;

    const missingAccounts = await matchFirebaseAccounts(asyncStorageEmails);

    if (!missingAccounts) {
        res.json([]);
    }

    res.json(missingAccounts);
    
});

export default globalRouter;
