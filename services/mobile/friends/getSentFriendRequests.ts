import InternalError from "@custom_errors/InternalError";
import { FIRESTORE_ADMIN } from '@config/firebaseConfig';

const getSentFriendRequests = async (userId: string) => {
    console.log("Attempting to retrieve sent friend requests...");

    try {
        const userDocRef = FIRESTORE_ADMIN.collection("users").doc(userId);
        const userInfoCollectionRef = userDocRef.collection("user_info");
        const friendRequestsDocRef = userInfoCollectionRef.doc("friendRequests");

        const friendRequestsDoc = await friendRequestsDocRef.get();
        if (!friendRequestsDoc.exists) {
            await friendRequestsDocRef.set({});
        }

        const sentCollectionRef = friendRequestsDocRef.collection("sent");
        const snapshot = await sentCollectionRef.get();

        const sentRequests = snapshot.docs.map(doc => doc.data());

        if (sentRequests.length === 0) {
            console.log("No sent friend requests found!");
            return [];
        }

        console.log("Found sent friend requests: ", sentRequests);
        return sentRequests;

    } catch (err) {
        console.error(err);
        throw new InternalError(`Error retrieving sent requests for user ${userId}`);
    }
};

export default getSentFriendRequests;
