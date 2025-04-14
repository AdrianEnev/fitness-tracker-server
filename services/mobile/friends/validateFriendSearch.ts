import InternalError from "@custom_errors/InternalError";
import { FIRESTORE_ADMIN } from '@config/firebaseConfig';

// searched user is already a friend of logged in user
const friendAlready = async (userToCheckId: any, loggedUserInfoCollectionRef: any) => {
    const friendsDocRef = FIRESTORE_ADMIN.doc(`${loggedUserInfoCollectionRef.path}/friends`);
    const listCollectionRef = FIRESTORE_ADMIN.collection(friendsDocRef.path + '/list');

    const friendDocRef = FIRESTORE_ADMIN.doc(`${listCollectionRef.path}/${userToCheckId}`);
    const friendDoc = await friendDocRef.get();

    if (friendDoc.exists) {
        console.log('User is already a friend!');
        return true;
    } else {
        return false;
    }
};

const requestPending = async (userToCheckId: any, loggedUserInfoCollectionRef: any, usersCollectionRef: any, loggedUserId: string) => {
    const loggedUserSentRequestsCollectionRef = FIRESTORE_ADMIN.collection(`${loggedUserInfoCollectionRef.path}/friendRequests/sent`);

    const otherUserDocRef = FIRESTORE_ADMIN.doc(`${usersCollectionRef.path}/${userToCheckId}`);
    const otherUserInfoCollectionRef = FIRESTORE_ADMIN.collection(`${otherUserDocRef.path}/user_info`);
    const otherUserSentRequestsCollectionRef = FIRESTORE_ADMIN.collection(`${otherUserInfoCollectionRef.path}/friendRequests/sent`);

    const sentRequestDocRef = FIRESTORE_ADMIN.doc(`${loggedUserSentRequestsCollectionRef.path}/${userToCheckId}`);
    const sentRequestDoc = await sentRequestDocRef.get();

    const receivedRequestDocRef = FIRESTORE_ADMIN.doc(`${otherUserSentRequestsCollectionRef.path}/${loggedUserId}`);
    const receivedRequestDoc = await receivedRequestDocRef.get();

    if (sentRequestDoc.exists || receivedRequestDoc.exists) {
        console.log('Friend request already sent!');
        return true;
    } else {
        return false;
    }
};

const userDisabledFriendRequests = async (userToCheckId: any, usersCollectionRef: any) => {
    const userDocRef = FIRESTORE_ADMIN.doc(`${usersCollectionRef.path}/${userToCheckId}`);
    const userInfoCollectionRef = FIRESTORE_ADMIN.collection(`${userDocRef.path}/user_info`);
    const receiveFriendRequestsDocRef = FIRESTORE_ADMIN.doc(`${userInfoCollectionRef.path}/receiveFriendRequests`);
    const receiveFriendRequestsDoc = await receiveFriendRequestsDocRef.get();

    if (receiveFriendRequestsDoc.exists) {
        const friendRequestsEnabled = receiveFriendRequestsDoc.data()?.receiveFriendRequests;

        if (friendRequestsEnabled === false) {
            console.log('User has disabled friend requests!');
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

const validateFriendSearch = async (userToCheckId: any, loggedUserId: any) => {
    try {
        const usersCollectionRef = FIRESTORE_ADMIN.collection('users');
        const loggedUserDocRef = FIRESTORE_ADMIN.doc(`${usersCollectionRef.path}/${loggedUserId}`);
        const loggedUserInfoCollectionRef = FIRESTORE_ADMIN.collection(`${loggedUserDocRef.path}/user_info`);

        const hasUserDisabledFriendRequests = await userDisabledFriendRequests(userToCheckId, usersCollectionRef);
        const isRequestPending = await requestPending(userToCheckId, loggedUserInfoCollectionRef, usersCollectionRef, loggedUserId);
        const isFriendAlready = await friendAlready(userToCheckId, loggedUserInfoCollectionRef);

        // User can receive friend request
        if (!hasUserDisabledFriendRequests && !isRequestPending && !isFriendAlready) {
            console.log('User can receive friend request!');
            return true;
        }

        // At least one of the variables was true, meaning user should not receive request
        console.log('User should not receive request!');
        return false;
    } catch (err) {
        throw new InternalError('Failed to validate friend search!');
    }
};

export default validateFriendSearch;
