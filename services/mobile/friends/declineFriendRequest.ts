import InternalError from "@custom_errors/InternalError";
import { FIRESTORE_ADMIN } from '@config/firebaseConfig';

const handleDeclineFriendRequest = async (userToCheck: any, loggedUserId: string) => {
    console.log(`Declining friend request from ${userToCheck.username}...`);

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

        console.log(`Successfully declined friend request from ${userToCheck.username}`);
    } catch (err) {
        console.error(err);
        throw new InternalError(`Error declining request to and by ${userToCheck.username}`);
    }
};

const declineFriendRequest = async (userToCheck: any, loggedUserId: string) => {
    try {
        await handleDeclineFriendRequest(userToCheck, loggedUserId);
    } catch (error) {
        throw new InternalError('Error declining friend request!');
    }
};

export default declineFriendRequest;
