import { collection, doc, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "../../../config/firebaseConfig";
import { Friend } from "../../../config/interfaces";

const getFriendsList = async (userId: string) => {

    console.log('Attempting to retreive friends list');

    const usersCollectionRef = collection(FIRESTORE_DB, 'users');
    const userDocRef = doc(usersCollectionRef, userId);
    const userInfoCollectionRef = collection(userDocRef, 'user_info');
    const friendsDocRef = doc(userInfoCollectionRef, 'friends');
    const listCollectionRef = collection(friendsDocRef, 'list');
    
    const querySnapshot = await getDocs(listCollectionRef);

    // No friends, return empty array
    if (!querySnapshot) {
        return [];
    }

    const friendsList: Friend[] = [];
    querySnapshot.forEach((doc) => {
        friendsList.push(doc.data() as Friend);
    });

    console.log('Info retreived:', friendsList)
    return friendsList;
}

export default getFriendsList;