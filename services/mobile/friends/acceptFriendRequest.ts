import InternalError from "@custom_errors/InternalError";
import { FIRESTORE_ADMIN } from '@config/firebaseConfig';

const handleAcceptFriendRequest = async (userToCheck: any, loggedUserUsername: string, loggedUserId: string) => {
    
    console.log('Attempting to accept friend request...');

    const requestDocRef = FIRESTORE_ADMIN
        .collection('users')
        .doc(loggedUserId)
        .collection('user_info')
        .doc('friendRequests')
        .collection('received')
        .doc(userToCheck.id);

    const receivedDocRef = FIRESTORE_ADMIN
        .collection('users')
        .doc(userToCheck.id)
        .collection('user_info')
        .doc('friendRequests')
        .collection('sent')
        .doc(loggedUserId);

    try {
        await FIRESTORE_ADMIN.runTransaction(async (transaction) => {
            transaction.delete(requestDocRef);
            transaction.delete(receivedDocRef);
        });
        console.log(`Steps 1 and 2 - successful (Deleted request to and by ${userToCheck.username})`);
    } catch (err) {
        console.error(err);
        throw new InternalError(`Steps 1 and 2 - error -> Error deleting request to and by ${userToCheck.username}:`);
    }

    const otherUserFriendsDocRef = FIRESTORE_ADMIN
        .collection('users')
        .doc(userToCheck.id)
        .collection('user_info')
        .doc('friends');

    const loggedInUserFriendsDocRef = FIRESTORE_ADMIN
        .collection('users')
        .doc(loggedUserId)
        .collection('user_info')
        .doc('friends');

    try {
        await FIRESTORE_ADMIN.runTransaction(async (transaction) => {
            const otherUserFriendsDoc = await transaction.get(otherUserFriendsDocRef);
            const loggedInUserFriendsDoc = await transaction.get(loggedInUserFriendsDocRef);

            if (!otherUserFriendsDoc.exists) {
                transaction.set(otherUserFriendsDocRef, {});
            }
            if (!loggedInUserFriendsDoc.exists) {
                transaction.set(loggedInUserFriendsDocRef, {});
            }

            const otherUserFriendsCollectionRef = otherUserFriendsDocRef.collection('list');
            const loggedInUserFriendsCollectionRef = loggedInUserFriendsDocRef.collection('list');

            transaction.set(
                otherUserFriendsCollectionRef.doc(loggedUserId),
                { username: loggedUserUsername, id: loggedUserId }
            );

            transaction.set(
                loggedInUserFriendsCollectionRef.doc(userToCheck.id),
                { username: userToCheck.username, id: userToCheck.id }
            );
        });

        console.log('Step 3 - successful (added friends to both users)');
    } catch (err) {
        console.error(err);
        throw new InternalError('Error accepting friend request!');
    }
};

const acceptFriendRequest = async (userToCheck: any, loggedUserUsername: string, loggedUserId: string) => {
    try {
        await handleAcceptFriendRequest(userToCheck, loggedUserUsername, loggedUserId);
    } catch (error) {
        throw new InternalError('Error accepting friend request!');
    }
};

export default acceptFriendRequest;
