import InternalError from "@custom_errors/InternalError";

import { FIRESTORE_ADMIN } from '@config/firebaseConfig';

const synclocalFoodDays = async (userId: string, localFoodDays: any) => {

    //console.log('Attempting to sync food days for', userId);

    if (!localFoodDays) {
        throw new InternalError('No food days to sync!');
    }

    const numlocalFoodDays = localFoodDays.length;

    if (numlocalFoodDays === 0) {
        //console.log('No food days to sync!');
        return;
    }

    try {
        const userDocRef = FIRESTORE_ADMIN.collection('users').doc(userId);
        const localFoodDaysCollectionRef = userDocRef.collection('food_days');
        const batch = FIRESTORE_ADMIN.batch();

        for (const { key, data } of localFoodDays) {
            const dateParts = key.split('-').slice(-3);
            const formattedDate = `${dateParts[2].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}-${dateParts[0]}`;
            const foodDayDocRef = localFoodDaysCollectionRef.doc(formattedDate);

            batch.set(foodDayDocRef, { title: formattedDate }, { merge: true });

            const foodsCollectionRef = foodDayDocRef.collection('foods');
            const existingFoods = await foodsCollectionRef.get();

            existingFoods.forEach(doc => batch.delete(doc.ref));

            let totalNutrients = { calories: 0, protein: 0, carbs: 0, fat: 0 };

            if (data) {
                data.forEach((foodItem: any) => {
                    const foodDocRef = foodsCollectionRef.doc(foodItem.id);
                    batch.set(foodDocRef, foodItem);

                    totalNutrients.calories += foodItem.calories || 0;
                    totalNutrients.protein += foodItem.protein || 0;
                    totalNutrients.carbs += foodItem.carbs || 0;
                    totalNutrients.fat += foodItem.fat || 0;
                });
            }

            batch.set(foodDayDocRef, totalNutrients, { merge: true });
        }

        await batch.commit();
        console.log('Synced food days!');

    } catch (error) {
        throw new InternalError('Error syncing food days');
    }
}

export default synclocalFoodDays;