import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../../../config/firebaseConfig";
import InternalError from "../../../errors/custom_errors/InternalError";
import ConflictError from "../../../errors/custom_errors/ConflictError";

// Friend requests -> received (from other user)
const sendFriendRequestToUser = async (userToCheck: any, loggedUserUsername: string, loggedUserId: any) => {

    const usersCollectionRef = collection(FIRESTORE_DB, 'users');
    const userDocRef = doc(usersCollectionRef, userToCheck.id);
    const userInfoCollectionRef = collection(userDocRef, 'user_info');
    const friendRequestsDocRef = doc(userInfoCollectionRef, 'friendRequests');
    const friendRequestsDoc = await getDoc(friendRequestsDocRef);

    // If the friendRequests document doesn't exist, create it
    if (!friendRequestsDoc.exists()) {
        await setDoc(friendRequestsDocRef, {});
    }

    const receivedCollectionRef = collection(friendRequestsDocRef, 'received');
    // Add a document with the id of the logged in user to the received collection
    const loggedInUserDocRef = doc(receivedCollectionRef, loggedUserId);
    await setDoc(loggedInUserDocRef, { username: loggedUserUsername, id: loggedUserId });
    console.log('Add friend request to other user as received');
}

// Friend requests -> sent (from logged in user)
const sendFriendRequestFromUser = async (userToCheck: any, loggedUserId: any) => {

    // TODO -> check how many friends user already has and add them to numSentRequests
    // That way the friend limit of 5 can't be bypassed

    const usersCollectionRef = collection(FIRESTORE_DB, 'users');
    const loggedInUserDocRef = doc(usersCollectionRef, loggedUserId);
    const userInfoCollectionRef = collection(loggedInUserDocRef, 'user_info');
    const friendRequestsDocRef = doc(userInfoCollectionRef, 'friendRequests');
    const friendRequestsDoc = await getDoc(friendRequestsDocRef);

    // If the friendRequests document doesn't exist, create it
    if (!friendRequestsDoc.exists()) {
        await setDoc(friendRequestsDocRef, {});
    }

    const sentCollectionRef = collection(friendRequestsDocRef, 'sent');
    const userDocRef = doc(sentCollectionRef, userToCheck.id);
    const userDoc = await getDoc(userDocRef);

    // If the document exists, throw an error because a friend request has already been sent to this user
    if (userDoc.exists()) {
        throw new ConflictError('Friend request already sent!');
    }

    // Get the number of existing sent friend requests
    const sentRequestsSnapshot = await getDocs(sentCollectionRef);
    const numSentRequests = sentRequestsSnapshot.size;

    // Check if the user has already sent 5 friend requests
    if (numSentRequests >= 5) {
        throw new ConflictError('You can only send 5 friend requests at a time!');
    }

    // Add a document with the id of the user to the sent collection
    await setDoc(userDocRef, { username: userToCheck.username, id: userToCheck.id });
}

const isFriendLimitReached = async (userLoggedId: any) => {

    const usersCollectionRef = collection(FIRESTORE_DB, 'users');
    const loggedInUserDocRef = doc(usersCollectionRef, userLoggedId);
    const userInfoCollectionRef = collection(loggedInUserDocRef, 'user_info');
    const friendsDocRef = doc(userInfoCollectionRef, 'friends');
    const friendsListCollectionRef = collection(friendsDocRef, 'list')

    // if friendsListCollectionRef contains 5 or more documents, return true
    const friendsSnapshot = await getDocs(friendsListCollectionRef);
    const numFriends = friendsSnapshot.size;

    // Friend limit -> 5
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
            await sendFriendRequestToUser(userToCheck, userLoggedId, loggedUserUsername);
            // Friend requests -> sent (from logged in user)
            await sendFriendRequestFromUser(userToCheck, userLoggedId);

            console.log('Successfuly sent friend request -> returning true')
        } catch (error) {
            throw new InternalError(`Error sending friend request to ${userToCheck.id}`)            
        }
    }
}

export default sendFriendRequest;