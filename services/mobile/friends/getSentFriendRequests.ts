import { collection, doc, setDoc, getDocs, getDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../../../config/firebaseConfig";
import InternalError from "../../../errors/custom_errors/InternalError";

const getSentFriendRequests = async (userId: string) => {

    console.log('Attempting to retreive sent friend requests...')

    const usersCollectionRef = collection(FIRESTORE_DB, 'users');
    const userDocRef = doc(usersCollectionRef, userId);
    const userInfoCollectionRef = collection(userDocRef, 'user_info');
    const friendRequestsDocRef = doc(userInfoCollectionRef, 'friendRequests');

    const friendRequestsDoc = await getDoc(friendRequestsDocRef);
    if (!friendRequestsDoc.exists()) {
        // if the friendRequests document does not exist, create a new empty one
        await setDoc(friendRequestsDocRef, {});
    }

    try{
        const sentCollectionRef = collection(friendRequestsDocRef, 'sent');
        const snapshot = await getDocs(sentCollectionRef);
        const sentRequests = snapshot.docs.map(doc => doc.data());

        if (!sentRequests) {
            console.log('No sent friend requests found!');
            return null
        }

        console.log('Found sent friend requests: ', sentRequests)
        return sentRequests;
    } catch (err) {
        throw new InternalError(`Error retreiving received requests for user ${userId}`);
    }
}

export default getSentFriendRequests;