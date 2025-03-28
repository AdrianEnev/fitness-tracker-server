import { collection, doc, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "../../../config/firebaseConfig";

// Get all workouts of a user
const getWorkouts = async (userId: string) => {

    // Reference to the user's workouts collection in Firestore
    const usersCollectionRef = collection(FIRESTORE_DB, 'users');
    const userDocRef = doc(usersCollectionRef, userId);
    const userWorkoutsCollectionRef = collection(userDocRef, 'workouts');

    const userWorkoutsSnapshot = await getDocs(userWorkoutsCollectionRef);
    return userWorkoutsSnapshot;

}

export default getWorkouts