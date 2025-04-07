import { doc, collection, runTransaction } from "firebase/firestore";
import InternalError from "../../../errors/custom_errors/InternalError";
import { FIRESTORE_DB } from "../../../config/firebaseConfig";

const handleRemoveFriend = async (userToCheckId: any, loggedUserId: string) => {

    const usersCollectionRef = collection(FIRESTORE_DB, 'users');
    const userDocRef = doc(usersCollectionRef, loggedUserId);
    const userInfoCollectionRef = collection(userDocRef, 'user_info');
    const friendsDocRef = doc(userInfoCollectionRef, 'friends');

    const loggedInUserFriendsCollectionRef = collection(friendsDocRef, 'list');
    const loggedInUserFriendDocRef = doc(loggedInUserFriendsCollectionRef, userToCheckId);

    const friendUserDocRef = doc(usersCollectionRef, userToCheckId);
    const friendUserInfoCollectionRef = collection(friendUserDocRef, 'user_info');
    const friendFriendsDocRef = doc(friendUserInfoCollectionRef, 'friends');
    const friendFriendsCollectionRef = collection(friendFriendsDocRef, 'list');
    const friendFriendDocRef = doc(friendFriendsCollectionRef, loggedUserId);
    
    try {
        await runTransaction(FIRESTORE_DB, async (transaction) => {
            transaction.delete(loggedInUserFriendDocRef);
            transaction.delete(friendFriendDocRef);
        });
        console.log('Delete operations successful');
    } catch (err) {
        throw new InternalError('Error deleting documents')
    }

}

const removeFriend = async (userToCheckId: any, loggedUserId: string) => {
    try {
        await handleRemoveFriend(userToCheckId, loggedUserId);
    } catch (error) {
        throw new InternalError('Error deleting friend request!');
    }
}

export default removeFriend;