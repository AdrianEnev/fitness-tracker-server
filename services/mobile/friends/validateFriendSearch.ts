import { collection, doc, getDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../../../config/firebaseConfig";
import InternalError from "../../../errors/custom_errors/InternalError";

// searched user is already a friend of logged in user
const friendAlready = async (userToCheckId: any, loggedUserInfoCollectionRef: any) => {

    const friendsDocRef = doc(loggedUserInfoCollectionRef, 'friends');
    const listCollectionRef = collection(friendsDocRef, 'list');

    const friendDocRef = doc(listCollectionRef, userToCheckId);
    const friendDoc = await getDoc(friendDocRef);

    if (friendDoc.data()) {
        return true
    } else {
        return false
    }

}

const requestPending = async (userToCheckId: any, loggedUserInfoCollectionRef: any, usersCollectionRef: any, loggedUserId: string) => {
        
    const loggedUserSentRequestsCollectionRef = collection(loggedUserInfoCollectionRef, 'friendRequests', 'sent');
    //const loggedUserReceivedRequestsCollectionRef = collection(loggedUserInfoCollectionRef, 'friendRequests', 'received');

    const otherUserDocRef = doc(usersCollectionRef, userToCheckId);
    const otherUserInfoCollectionRef = collection(otherUserDocRef, 'user_info');
    const otherUserSentRequestsCollectionRef = collection(otherUserInfoCollectionRef, 'friendRequests', 'sent');

    // Check if the current user has sent a request to the other user
    const sentRequestDocRef = doc(loggedUserSentRequestsCollectionRef, userToCheckId);
    const sentRequestDoc = await getDoc(sentRequestDocRef);

    // Check if the other user has sent a request to the current user
    const receivedRequestDocRef = doc(otherUserSentRequestsCollectionRef, loggedUserId);
    const receivedRequestDoc = await getDoc(receivedRequestDocRef);

    if (sentRequestDoc.exists() || receivedRequestDoc.exists()) {
        return true
    } else {
        return false
    }
};

const userDisabledFriendRequests = async (userToCheckId: any, usersCollectionRef: any) => {

    const userDocRef = doc(usersCollectionRef, userToCheckId);
    const userInfoCollectionRef = collection(userDocRef, 'user_info');
    const receiveFriendRequestsDocRef = doc(userInfoCollectionRef, 'receiveFriendRequests');
    const receiveFriendRequestsDoc = await getDoc(receiveFriendRequestsDocRef);

    if (receiveFriendRequestsDoc.data()) {
        const friendRequestsEnabled = receiveFriendRequestsDoc.data()?.receiveFriendRequests;

        if (friendRequestsEnabled === false) {
            return true
        } else {
            return false
        }
    } else {
        return false
    }
    
}

const validateFriendSearch = async (userToCheckId: any, loggedUserId: any) => {

    try {
        const usersCollectionRef = collection(FIRESTORE_DB, 'users');
        const loggedUserDocRef = doc(usersCollectionRef, loggedUserId);
        const loggedUserInfoCollectionRef = collection(loggedUserDocRef, 'user_info');

        const hasUserDisabledFriendRequests = await userDisabledFriendRequests(userToCheckId, usersCollectionRef);
        const isRequestPending = await requestPending(userToCheckId, loggedUserInfoCollectionRef, usersCollectionRef, loggedUserId);
        const isFriendAlready = await friendAlready(userToCheckId, loggedUserInfoCollectionRef);

        // User can receive friend request
        if (!hasUserDisabledFriendRequests && !isRequestPending && !isFriendAlready) {
            return true
        }

        // At least one of the variables was true, meaning user should not receive request
        console.log('has user diabled their friend requests?:', hasUserDisabledFriendRequests)
        console.log('Has logged in user already sent a request to other user?:', isRequestPending)
        console.log('is the user already a friend?:', isFriendAlready);
        return false
    }catch(err) {
        throw new InternalError('Failed to validate friend search!');
    }
}

export default validateFriendSearch;