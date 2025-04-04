import express from 'express';
import getFriendsList from '../services/mobile/friends/getFriendsList';
import validateUserId from '../services/validateUserId';
import EntityNotFoundError from '../errors/custom_errors/EntityNotFoundError';
const friendsRouter = express.Router();

// Returns all friends of a specific user
friendsRouter.get('/:userId', async (req, res) => {
    
    const userId: string = req.params.userId;

    await validateUserId(userId);

    const friends = await getFriendsList(userId);

    if (!friends) {
        throw new EntityNotFoundError('Could not retreive any friends!')
    }

    res.json(friends);
    
});

export default friendsRouter;