import { FIRESTORE_DB } from "@config/firebaseConfig";
import { getDocs, collection, setDoc, doc } from "firebase/firestore";

const registerUser = async (username: string, newUser: any) => {
    try {
        const usernameTaken = await checkIsUsernameTaken(username);

        if (usernameTaken) {
            return 'username-taken';
        }

        const usersCollectionRef = collection(FIRESTORE_DB, 'users');
        const userDocRef = doc(usersCollectionRef, newUser.uid);

        await setDoc(userDocRef, { lungeCoins: 1, lastGeneratedWorkout: null }, { merge: false });
        return 'success';
    } catch(err: any) {
        console.error('Error finishing registration', err)
        return 'error'
    }
}

const checkIsUsernameTaken = async (trimmedUsername: any) => {
    const usersSnapshot = await getDocs(collection(FIRESTORE_DB, 'users'));

    for (const doc of usersSnapshot.docs) {
        const userInfoCollectionRef = collection(doc.ref, 'user_info');
        const usernameDoc = await getDocs(userInfoCollectionRef);

        for (const user of usernameDoc.docs) {
            if (user.id === 'username' && user.data().username.trim() === trimmedUsername) {
                return true; // Username is taken
            }
        }
    }

    // Username is not taken
    return false; 
}

export default registerUser;