import express, { Request, Response } from 'express';
import getFriendsList from '../services/mobile/friends/getFriendsList';
import validateUserId from '../services/validateUserId';
import EntityNotFoundError from '../errors/custom_errors/EntityNotFoundError';
import validateFriendSearch from '../services/mobile/friends/validateFriendSearch';
import getReceivedFriendRequests from '../services/mobile/friends/getRecevedFriendRequests';
import sendFriendRequest from '../services/mobile/friends/sendFriendRequest';
import getSentFriendRequests from '../services/mobile/friends/getSentFriendRequests';
const friendsRouter = express.Router();

// Gets all friend requests a user has received
friendsRouter.get('/:userId/received', async (req, res) => {

    const userId: string = req.params.userId;

    await validateUserId(userId);

    const receivedRequests = await getReceivedFriendRequests(userId);
    res.json(receivedRequests);

})

// Gets all friend requests a user has sent
friendsRouter.get('/:userId/sent', async (req, res) => {

    const userId: string = req.params.userId;

    await validateUserId(userId);

    const sentRequests = await getSentFriendRequests(userId);
    res.json(sentRequests);

})

// Takes in currentUser and searchedUser and checks if searched user should be added to search list
// Example: if searchedUser has disabled their friend requests -> return false
friendsRouter.get('/:loggedUserId/:userToCheckId', async (req, res) => {

    const loggedUserId: string = req.params.loggedUserId;
    const userToCheckId: string = req.params.userToCheckId;

    await validateUserId(loggedUserId);
    await validateUserId(userToCheckId);

    const acceptSearch: boolean = await validateFriendSearch(userToCheckId, loggedUserId);
    res.json(acceptSearch);
})

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

// Send friend request from logged in user to other user
// userToCheck = user receiving request (keeping the same name convention across all friend methods)
friendsRouter.post('/:loggedUserId', async (req, res) => {

    const loggedUserId: string = req.params.loggedUserId;
    
    const { userToCheck, loggedUserUsername } = req.body

    await validateUserId(loggedUserId);
    await validateUserId(userToCheck.id);
    
    await sendFriendRequest(userToCheck, loggedUserUsername, loggedUserId);  
    res.status(200).json({ message: 'Friend request sent successfully!' });

}); 

export default friendsRouter;