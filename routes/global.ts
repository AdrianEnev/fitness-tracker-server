import matchFirebaseAccounts from '@services/matchFirebaseAccounts';
import searchForFriend from '@services/mobile/friends/searchFriend';
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

// Used to check if similar users exist anywhere in the database
// Ex: search - john -> results "john123", "john1234", "john12345" etc.
globalRouter.get('/searchFriend', async (req, res) => {

    const search = req.query.search as string;

    const suggestions = await searchForFriend(search);
    res.json(suggestions);

})


export default globalRouter;
