import InternalError from "@custom_errors/InternalError";
import { FIRESTORE_ADMIN } from '@config/firebaseConfig';

const handleDeleteFriendRequest = async (userToCheck: any, loggedUserId: string) => {
    
    const usersCollectionRef = FIRESTORE_ADMIN.collection('users');

    const requestDocRef = usersCollectionRef
        .doc(loggedUserId)
        .collection('user_info')
        .doc('friendRequests')
        .collection('sent')
        .doc(userToCheck.id);

    try {
        await requestDocRef.delete();
        console.log(`Step 1 - successful (Deleted request to ${userToCheck.username})`);
    } catch (err) {
        console.error('Step 1 - error -> ', err);
        throw new InternalError(`Error deleting request to ${userToCheck.username}`);
    }

    const receivedDocRef = usersCollectionRef
        .doc(userToCheck.id)
        .collection('user_info')
        .doc('friendRequests')
        .collection('received')
        .doc(loggedUserId);

    try {
        await receivedDocRef.delete();
        console.log(`Step 2 - successful (Deleted request by ${userToCheck.username})`);
    } catch (err) {
        console.error('Step 2 - error -> ', err);
        // Optional: silently fail or throw an error depending on your preference
    }
};

const deleteFriendRequest = async (userToCheck: any, loggedUserId: string) => {
    try {
        await handleDeleteFriendRequest(userToCheck, loggedUserId);
    } catch (error) {
        throw new InternalError('Error deleting friend request!');
    }
};

export default deleteFriendRequest;
