import { Friend } from "@config/interfaces";
import { FIRESTORE_ADMIN } from '@config/firebaseConfig';

const getFriendsList = async (userId: string): Promise<Friend[]> => {
    console.log('Attempting to retrieve friends list');

    try {
        const listCollectionRef = FIRESTORE_ADMIN
            .collection('users')
            .doc(userId)
            .collection('user_info')
            .doc('friends')
            .collection('list');

        const querySnapshot = await listCollectionRef.get();

        if (querySnapshot.empty) {
            return [];
        }

        const friendsList: Friend[] = [];
        querySnapshot.forEach((doc) => {
            friendsList.push(doc.data() as Friend);
        });

        console.log('Info retrieved:', friendsList);
        return friendsList;

    } catch (error) {
        console.error("Error retrieving friends list:", error);
        throw new Error("Unable to fetch friends list");
    }
};

export default getFriendsList;
