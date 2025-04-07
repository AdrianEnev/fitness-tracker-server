import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import { FIRESTORE_DB } from "../../config/firebaseConfig";
import InternalError from "../../errors/custom_errors/InternalError";

const synclocalFoodDays = async (userId: string, localFoodDays: any) => {

    console.log('Sync FOOD DAYS?', userId)

    if (!localFoodDays) {
        throw new InternalError('No food days to sync!')
    }

    // Local storage workouts
    const numlocalFoodDays = localFoodDays.length;

    // 0 workouts stored locally -> nothing to sync
    if (numlocalFoodDays == 0) {
        console.log('No food days to sync!')
        return;
    }

    try {
        // Create firebase instance
        const usersCollectionRef = collection(FIRESTORE_DB, 'users');
        const userDocRef = doc(usersCollectionRef, userId);
        const localFoodDaysCollectionRef = collection(userDocRef, 'food_days');  

        // Use a single batch for all operations
        const batch = writeBatch(FIRESTORE_DB);

        for (const { key, data } of localFoodDays) {
            // Extract the date and format it as YY-MM-DD with leading zeros
            const dateParts = key.split('-').slice(-3);
            const formattedDate = `${dateParts[2].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}-${dateParts[0]}`;

            const foodDayDocRef = doc(localFoodDaysCollectionRef, formattedDate);

            batch.set(foodDayDocRef, { title: formattedDate }, { merge: true });

            const foodsCollectionRef = collection(foodDayDocRef, 'foods');

            // Clear existing foods in the collection (cannot be done in batch)
            const existingFoods = await getDocs(foodsCollectionRef);
            existingFoods.docs.forEach(doc => batch.delete(doc.ref));

            let totalNutrients = { calories: 0, protein: 0, carbs: 0, fat: 0 };

            if (data) {
                data.forEach((foodItem: any) => {
                    const foodDocRef = doc(foodsCollectionRef, foodItem.id);
                    batch.set(foodDocRef, foodItem);

                    // Accumulate nutrients
                    totalNutrients.calories += foodItem.calories || 0;
                    totalNutrients.protein += foodItem.protein || 0;
                    totalNutrients.carbs += foodItem.carbs || 0;
                    totalNutrients.fat += foodItem.fat || 0;
                });
            }

            // Update the parent document with the total nutrients
            batch.set(foodDayDocRef, totalNutrients, { merge: true });
        }

        // Commit the batch
        await batch.commit();
        console.log('Synced food days!');

    } catch (error) {
        throw new InternalError('Error syncing food days');
    }

}

export default synclocalFoodDays;