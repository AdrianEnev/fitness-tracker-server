import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "../../config/firebaseConfig";
import type { FoodDay, Food } from '../../config/interfaces';

// Gets all info about specific food day using its date
const getFoodDay = async (foodDayDate: string, userId: any): Promise<FoodDay | null> => {
   
    const usersCollectionRef = collection(FIRESTORE_DB, 'users');
    const userDocRef = doc(usersCollectionRef, userId);
    const foodDaysCollectionRef = collection(userDocRef, "food_days");
    const foodDayDocRef = doc(foodDaysCollectionRef, foodDayDate);

    const foodDaySnapshot = await getDoc(foodDayDocRef);

    if (!foodDaySnapshot.exists()) {
        console.log('No food day found, returning null');
        return null;
    }

    const foodDayData = foodDaySnapshot.data();
    const foods: Food[] = [];

    const foodsCollectionRef = collection(foodDayDocRef, 'foods');
    const foodsSnapshot = await getDocs(foodsCollectionRef);

    for (const foodDoc of foodsSnapshot.docs) {
        foods.push({
            ...foodDoc.data(),
            id: foodDoc.id
        } as Food);
    }

    return {
        ...foodDayData,
        foods,
        id: foodDaySnapshot.id
    } as any;
};

export default getFoodDay;