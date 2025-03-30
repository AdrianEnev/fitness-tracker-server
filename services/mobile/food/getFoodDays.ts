import { collection, doc, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "../../../config/firebaseConfig";

// Gets a snapshot of food day documents. Effective for updates but not for displaying info
// Different from getFoodDays() inside getUserInfo.tsx
const getFoodDays = async (userId: string) => {

    // Reference to the user's workouts collection in Firestore
    const usersCollectionRef = collection(FIRESTORE_DB, 'users');
    const userDocRef = doc(usersCollectionRef, userId);
    const userFoodDaysCollectionRef = collection(userDocRef, 'food_days');

    const userFoodDaysSnapshot = await getDocs(userFoodDaysCollectionRef);
    return userFoodDaysSnapshot;

}

export default getFoodDays