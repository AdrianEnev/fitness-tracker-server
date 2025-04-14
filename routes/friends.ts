import express, { Request, Response } from 'express';
import getFriendsList from '@services/mobile/friends/getFriendsList';
import validateUserId from '@services/validateUserId';
import EntityNotFoundError from '@custom_errors/EntityNotFoundError';
import validateFriendSearch from '@services/mobile/friends/validateFriendSearch';
import getReceivedFriendRequests from '@services/mobile/friends/getRecevedFriendRequests';
import sendFriendRequest from '@services/mobile/friends/sendFriendRequest';
import getSentFriendRequests from '@services/mobile/friends/getSentFriendRequests';
import declineFriendRequest from '@services/mobile/friends/declineFriendRequest';
import acceptFriendRequest from '@services/mobile/friends/acceptFriendRequest';
import deleteFriendRequest from '@services/mobile/friends/deleteFriendRequest';
import removeFriend from '@services/mobile/friends/removeFriend';
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
});

// Accepts friend request sent to logged in user
// User to check should be the sender of the friend request
// loggedUserId would be the receiver
friendsRouter.put('/:loggedUserId/accept', async (req, res) => {

    const loggedUserId: string = req.params.loggedUserId;
    
    const { userToCheck, loggedUserUsername } = req.body

    await validateUserId(loggedUserId);
    await validateUserId(userToCheck.id);

    await acceptFriendRequest(userToCheck, loggedUserUsername, loggedUserId);
    res.status(200).json({ message: 'Friend request accepted successfully!' });

});

// Declines friend request sent to logged in user
// User to check should be the sender of the friend request
// loggedUserId would be the receiver
friendsRouter.put('/:loggedUserId/decline', async (req, res) => {

    const loggedUserId: string = req.params.loggedUserId;
    
    const { userToCheck } = req.body

    await validateUserId(loggedUserId);
    await validateUserId(userToCheck.id);

    await declineFriendRequest(userToCheck, loggedUserId);
    res.status(200).json({ message: 'Friend request declined successfully!' });

})

// Removes friend from friends list
friendsRouter.delete('/:loggedUserId/:userToCheckId', async (req, res) => {

    const loggedUserId: string = req.params.loggedUserId;
    const userToCheckId: string = req.params.userToCheckId;

    await validateUserId(loggedUserId);
    await validateUserId(userToCheckId);

    await removeFriend(userToCheckId, loggedUserId);
    res.status(200).json({ message: 'Friend removed successfully!' });

});

// Unsends already sent friend request
friendsRouter.delete('/:loggedUserId', async (req, res) => {
    
    const loggedUserId: string = req.params.loggedUserId;
    
    const { userToCheck } = req.body

    await validateUserId(loggedUserId);
    await validateUserId(userToCheck.id);

    await deleteFriendRequest(userToCheck, loggedUserId);
    res.status(200).json({ message: 'Friend request deleted successfully!' });

});

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