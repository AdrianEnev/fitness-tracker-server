import InternalError from "@custom_errors/InternalError";
import { FIRESTORE_ADMIN } from '@config/firebaseConfig';

const handleRemoveFriend = async (userToCheckId: any, loggedUserId: string) => {
    console.log('Attempting to remove friend...');

    const usersCollectionRef = FIRESTORE_ADMIN.collection('users');
    const userDocRef = usersCollectionRef.doc(loggedUserId);
    const userInfoCollectionRef = userDocRef.collection('user_info');
    const friendsDocRef = userInfoCollectionRef.doc('friends');
    const loggedInUserFriendsCollectionRef = friendsDocRef.collection('list');
    const loggedInUserFriendDocRef = loggedInUserFriendsCollectionRef.doc(userToCheckId);

    const friendUserDocRef = usersCollectionRef.doc(userToCheckId);
    const friendUserInfoCollectionRef = friendUserDocRef.collection('user_info');
    const friendFriendsDocRef = friendUserInfoCollectionRef.doc('friends');
    const friendFriendsCollectionRef = friendFriendsDocRef.collection('list');
    const friendFriendDocRef = friendFriendsCollectionRef.doc(loggedUserId);

    try {
        await FIRESTORE_ADMIN.runTransaction(async (transaction) => {
            // Delete the friend relationship in both user's friend lists
            transaction.delete(loggedInUserFriendDocRef);
            transaction.delete(friendFriendDocRef);
        });
        console.log('Friendship removed successfully');
    } catch (err) {
        console.error(err);
        throw new InternalError('Error deleting friend relationship!');
    }
};

const removeFriend = async (userToCheckId: any, loggedUserId: string) => {
    try {
        await handleRemoveFriend(userToCheckId, loggedUserId);
    } catch (error) {
        throw new InternalError('Error removing friend!');
    }
};

export default removeFriend;
