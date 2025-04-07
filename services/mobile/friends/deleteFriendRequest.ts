import { doc, collection, runTransaction, deleteDoc } from "firebase/firestore";
import InternalError from "../../../errors/custom_errors/InternalError";
import { FIRESTORE_DB } from "../../../config/firebaseConfig";

const handleDeleteFriendRequest = async (userToCheck: any, loggedUserId: string) => {

    const usersCollectionRef = collection(FIRESTORE_DB, 'users');

    const userDocRef = doc(usersCollectionRef, loggedUserId);
    const userInfoCollectionRef = collection(userDocRef, 'user_info');
    const friendRequestsDocRef = doc(userInfoCollectionRef, 'friendRequests');

    // delete sent from logged user
    const sentCollectionRef = collection(friendRequestsDocRef, 'sent');
    const requestDocRef = doc(sentCollectionRef, userToCheck.id);

    try {
        await deleteDoc(requestDocRef);
        console.log(`Step 1 - sucessful (Deleted request to ${userToCheck.username})`);

    } catch (err) {
        throw new InternalError(`Error deleting request to ${userToCheck.username}`);
    }

    // delete recieved from other user
    const otherUserDocRef = doc(usersCollectionRef, userToCheck.id);
    const otherUserInfoCollectionRef = collection(otherUserDocRef, 'user_info');
    const otherUserFriendRequestsDocRef = doc(otherUserInfoCollectionRef, 'friendRequests');

    try {
        const receivedCollectionRef = collection(otherUserFriendRequestsDocRef, 'received');
        const recievedDocRef = doc(receivedCollectionRef, loggedUserId)

        await deleteDoc(recievedDocRef)
        console.log(`Step 2 - successful (deleted request by ${userToCheck.username})`)

    }catch (err) {
        console.log('Step 2 - error -> ', err)
    }

}

const deleteFriendRequest = async (userToCheck: any, loggedUserId: string) => {
    try {
        await handleDeleteFriendRequest(userToCheck, loggedUserId);
    } catch (error) {
        throw new InternalError('Error deleting friend request!');
    }
}

export default deleteFriendRequest;