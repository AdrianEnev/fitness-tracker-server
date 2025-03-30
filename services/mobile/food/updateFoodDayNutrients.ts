import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../../../config/firebaseConfig";

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