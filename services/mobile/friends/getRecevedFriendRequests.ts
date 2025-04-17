import InternalError from "@custom_errors/InternalError";
import { FIRESTORE_ADMIN } from '@config/firebaseConfig';

const getReceivedFriendRequests = async (userId: string, getUsers: boolean) => {

    console.log("Attempting to retrieve received friend requests...");

    try {
        const userDocRef = FIRESTORE_ADMIN.collection("users").doc(userId);
        const userInfoCollectionRef = userDocRef.collection("user_info");
        const friendRequestsDocRef = userInfoCollectionRef.doc("friendRequests");

        const friendRequestsDoc = await friendRequestsDocRef.get();
        if (!friendRequestsDoc.exists) {
            await friendRequestsDocRef.set({});
        }

        const receivedCollectionRef = friendRequestsDocRef.collection("received");
        const snapshot = await receivedCollectionRef.get();

        // getUsers is false -> only the number of received requests is needed
        // Otherwise all users who have sent a request to user are returned
        if (!getUsers){
            return snapshot.size;
        }

        const receivedRequests = snapshot.docs.map(doc => {
            const data = doc.data();

            // Flipped because of frontend behavior
            return {
                id: data.username,
                username: data.id
            };
        });

        if (receivedRequests.length === 0) {
            console.log("No received friend requests found!");
            return [];
        }

        console.log("Found received friend requests: ", receivedRequests);
        return receivedRequests;

    } catch (err) {
        console.error(err);
        throw new InternalError(`Error retrieving received requests for user ${userId}`);
    }
};

export default getReceivedFriendRequests;
