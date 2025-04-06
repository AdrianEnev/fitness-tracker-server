import { doc, collection, runTransaction } from "firebase/firestore";
import InternalError from "../../../errors/custom_errors/InternalError";
import { FIRESTORE_DB } from "../../../config/firebaseConfig";

const handleDeclineFriendRequest = async (userToCheck: any, loggedUserId: string) => {

    const usersCollectionRef = collection(FIRESTORE_DB, 'users');
    const userDocRef = doc(usersCollectionRef, loggedUserId);
    const userInfoCollectionRef = collection(userDocRef, 'user_info');
    const friendRequestsDocRef = doc(userInfoCollectionRef, 'friendRequests');

    // delete sent from logged user
    const sentCollectionRef = collection(friendRequestsDocRef, 'received');
    const requestDocRef = doc(sentCollectionRef, userToCheck.id);

    // delete received from other user
    const otherUserDocRef = doc(usersCollectionRef, userToCheck.id);
    const otherUserInfoCollectionRef = collection(otherUserDocRef, 'user_info');
    const otherUserFriendRequestsDocRef = doc(otherUserInfoCollectionRef, 'friendRequests');
    const receivedCollectionRef = collection(otherUserFriendRequestsDocRef, 'sent');
    const receivedDocRef = doc(receivedCollectionRef, loggedUserId)

    try {
        await runTransaction(FIRESTORE_DB, async (transaction) => {
            transaction.delete(requestDocRef);
            transaction.delete(receivedDocRef);
        });
        console.log(`Steps 1 and 2 - successful (Deleted request to and by ${userToCheck.username})`);
    } catch (err) {
        console.error(`Steps 1 and 2 - error -> Error deleting request to and by ${userToCheck.username}: `, err);
    }

}

const declineFriendRequest = async (userToCheck: any, loggedUserId: string) => {
    try {
        await handleDeclineFriendRequest(userToCheck, loggedUserId);
    } catch (error) {
        throw new InternalError('Error declining friend request!');
    }
};

export default declineFriendRequest