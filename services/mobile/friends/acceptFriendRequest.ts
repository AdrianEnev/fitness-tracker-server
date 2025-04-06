import { doc, collection, runTransaction } from "firebase/firestore";
import InternalError from "../../../errors/custom_errors/InternalError";
import { FIRESTORE_DB } from "../../../config/firebaseConfig";

const handleAcceptFriendRequest = async (userToCheck: any, loggedUserUsername: string, loggedUserId: string) => {
    
    console.log('Attempting to accept friend request...');

    const usersCollectionRef = collection(FIRESTORE_DB, 'users');
    const userDocRef = doc(usersCollectionRef, loggedUserId);
    const userInfoCollectionRef = collection(userDocRef, 'user_info');
    const friendRequestsDocRef = doc(userInfoCollectionRef, 'friendRequests');
 
    // delete sent from logged user - Step 1
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
        throw new InternalError(`Steps 1 and 2 - error -> Error deleting request to and by ${userToCheck.username}: `);
    }

    // Add to friends list - Step 2
    const otherUserFriendsDocRef = doc(otherUserInfoCollectionRef, 'friends');
    const loggedInUserFriendsDocRef = doc(userInfoCollectionRef, 'friends');

    try {
        await runTransaction(FIRESTORE_DB, async (transaction) => {
            const otherUserFriendsDoc = await transaction.get(otherUserFriendsDocRef);
            const loggedInUserFriendsDoc = await transaction.get(loggedInUserFriendsDocRef);

            if (!otherUserFriendsDoc.exists()) {
                transaction.set(otherUserFriendsDocRef, {});
            }
            if (!loggedInUserFriendsDoc.exists()) {
                transaction.set(loggedInUserFriendsDocRef, {});
            }

            const otherUserFriendsCollectionRef = collection(otherUserFriendsDocRef, 'list');
            const loggedInUserFriendsCollectionRef = collection(loggedInUserFriendsDocRef, 'list');

            transaction.set(doc(otherUserFriendsCollectionRef, loggedUserId), { username: loggedUserUsername, id: loggedUserId });
            transaction.set(doc(loggedInUserFriendsCollectionRef, userToCheck.id), { username: userToCheck.username, id: userToCheck.id });
        });

        console.log('Step 3 - successful (added friends to both users)');

    } catch (err) {
        throw new InternalError('Error accepting friend request!');
    }
    
}

const acceptFriendRequest = async (userToCheck: any, loggedUserUsername: string, loggedUserId: string) => {
    try {
        await handleAcceptFriendRequest(userToCheck, loggedUserUsername, loggedUserId);
    } catch (error) {
        throw new InternalError('Error accepting friend request!');
    }
  };

export default acceptFriendRequest