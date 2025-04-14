import type { FoodDay, Food } from '@config/interfaces';
import { FIRESTORE_ADMIN } from '@config/firebaseConfig';

// Gets all info about specific food day using its date
const getFoodDay = async (foodDayDate: string, userId: any): Promise<FoodDay | null> => {

    const userDocRef = FIRESTORE_ADMIN.collection('users').doc(userId);
    const foodDayDocRef = userDocRef.collection("food_days").doc(foodDayDate);

    const foodDaySnapshot = await foodDayDocRef.get();

    if (!foodDaySnapshot.exists) {
        console.log('No food day found, returning null');
        return null;
    }

    const foodDayData = foodDaySnapshot.data();
    const foods: Food[] = [];

    const foodsSnapshot = await foodDayDocRef.collection('foods').get();

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
