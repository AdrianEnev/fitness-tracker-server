import { collection, doc, getDoc, setDoc, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "../../../config/firebaseConfig";
import InternalError from "../../../errors/custom_errors/InternalError";

const getReceivedFriendRequests = async (userId: string) => {

    console.log('Attempting to retreive received friend requests...')

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
        const receivedCollectionRef = collection(friendRequestsDocRef, 'received');
        const snapshot = await getDocs(receivedCollectionRef);
        const receivedRequests = snapshot.docs.map(doc => {
            const data = doc.data();

            // Flipped because they seem to be getting swapped somewhere in the frontend
            return {
                id: data.username,      
                username: data.id       
            };
        });

        if (!receivedRequests) {
            console.log('No received friend requests found!');
            return null
        }

        console.log('Found received friend requests: ', receivedRequests)
        return receivedRequests;
    } catch (err) {
        throw new InternalError(`Error retreiving received requests for user ${userId}`);
    }
}

export default getReceivedFriendRequests;