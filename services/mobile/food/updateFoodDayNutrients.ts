import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../../../config/firebaseConfig";

// Update the nutrients of a specific food day
// Example -> 03.10.2069 - { calories: 100, protein: 100, carbs: 100, fat: 100 }
// -> 03.10.2069 - { calories: 200, protein: 200, carbs: 200, fat: 200 }
// Runs every time a food item is added to a food day
const updateNutrients = async (updatedNutrients: any, formattedDate: any, userId: string) => {

    console.log('Updating nutrients for day: ', formattedDate)
    console.log('New nutrients: ', updatedNutrients);

    // Update Firestore
    const usersCollectionRef = collection(FIRESTORE_DB, 'users');
    const userDocRef = doc(usersCollectionRef, userId);
    const foodDaysCollectionRef = collection(userDocRef, 'food_days');  
    const foodDayDocRef = doc(foodDaysCollectionRef, formattedDate);

    const docSnapshot = await getDoc(foodDayDocRef);

    if (docSnapshot.exists()) {
        await updateDoc(foodDayDocRef, updatedNutrients);
    } else {
        await setDoc(foodDayDocRef, updatedNutrients);
    }
}

export default updateNutrients