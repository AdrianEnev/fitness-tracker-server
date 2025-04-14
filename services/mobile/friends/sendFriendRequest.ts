import InternalError from "@custom_errors/InternalError";
import ConflictError from "@custom_errors/ConflictError";
import { FIRESTORE_ADMIN } from '@config/firebaseConfig';

// Friend requests -> received (from other user)
const sendFriendRequestToUser = async (userToCheck: any, loggedUserUsername: string, loggedUserId: any) => {

    const userDocRef = FIRESTORE_ADMIN.collection('users').doc(userToCheck.id).collection('user_info').doc('friendRequests');
    const friendRequestsDoc = await userDocRef.get();

    // If the friendRequests document doesn't exist, create it
    if (!friendRequestsDoc.exists) {
        await userDocRef.set({});
    }

    const receivedCollectionRef = userDocRef.collection('received');
    const loggedInUserDocRef = receivedCollectionRef.doc(loggedUserId);
    await loggedInUserDocRef.set({ username: loggedUserUsername, id: loggedUserId });
    console.log('Add friend request to other user as received');
}

// Friend requests -> sent (from logged in user)
const sendFriendRequestFromUser = async (userToCheck: any, loggedUserId: any) => {

    const loggedInUserDocRef = FIRESTORE_ADMIN.collection('users').doc(loggedUserId).collection('user_info').doc('friendRequests');
    const friendRequestsDoc = await loggedInUserDocRef.get();

    // If the friendRequests document doesn't exist, create it
    if (!friendRequestsDoc.exists) {
        await loggedInUserDocRef.set({});
    }

    const sentCollectionRef = loggedInUserDocRef.collection('sent');
    const userDocRef = sentCollectionRef.doc(userToCheck.id);
    const userDoc = await userDocRef.get();

    // If the document exists, throw an error because a friend request has already been sent to this user
    if (userDoc.exists) {
        throw new ConflictError('Friend request already sent!');
    }

    // Get the number of existing sent friend requests
    const sentRequestsSnapshot = await sentCollectionRef.get();
    const numSentRequests = sentRequestsSnapshot.size;

    // Check if the user has already sent 5 friend requests
    if (numSentRequests >= 5) {
        throw new ConflictError('You can only send 5 friend requests at a time!');
    }

    // Add a document with the id of the user to the sent collection
    await userDocRef.set({ username: userToCheck.username, id: userToCheck.id });
}

// Check if the friend limit has been reached
const isFriendLimitReached = async (userLoggedId: any) => {

    const friendsListCollectionRef = FIRESTORE_ADMIN.collection('users').doc(userLoggedId).collection('user_info').doc('friends').collection('list');

    // If friendsListCollectionRef contains 5 or more documents, return true
    const friendsSnapshot = await friendsListCollectionRef.get();
    const numFriends = friendsSnapshot.size;

    // Friend limit -> 5
    console.log('Is friend limit reached? ', numFriends >= 5);
    return numFriends >= 5; 
}

// Function to send a friend request
const sendFriendRequest = async (userToCheck: any, loggedUserUsername: string, userLoggedId: string) => {

    console.log('Attempting to send friend request...')

    if (await isFriendLimitReached(userLoggedId)) {
        throw new ConflictError('Friend limit reached!')
    }

    if (userLoggedId) {
        try {
            // Friend requests -> received (from other user)
            await sendFriendRequestToUser(userToCheck, loggedUserUsername, userLoggedId);
            // Friend requests -> sent (from logged in user)
            await sendFriendRequestFromUser(userToCheck, userLoggedId);

            console.log('Successfully sent friend request -> returning true')
        } catch (error) {
            throw new InternalError(`Error sending friend request to ${userToCheck.id}`)            
        }
    }
}

export default sendFriendRequest;
