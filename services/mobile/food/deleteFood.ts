import updateNutrients from "./updateFoodDayNutrients";
import ValidationError from "@custom_errors/ValidationError";
import InternalError from "@custom_errors/InternalError";
import { FIRESTORE_ADMIN } from '@config/firebaseConfig';

const deleteFoodItem = async (item: any, formattedDate: any, updatedNutrients: any, userId: string) => {
    console.log('Deleting item from date:', formattedDate);
    console.log('Item to delete:', item);

    if (!item || !formattedDate || !updatedNutrients) {
        throw new ValidationError('Invalid item/formattedDate/updatedNutrients passed to deleteFoodItem');
    }

    const foodDayDocRef = FIRESTORE_ADMIN
        .collection('users')
        .doc(userId)
        .collection('food_days')
        .doc(formattedDate);

    const foodDocRef = foodDayDocRef
        .collection('foods')
        .doc(item.id);

    try {
        console.log('Deleting document with id:', item.id);
        await foodDocRef.delete();
        console.log('Food item deleted!');
        console.log('Recalculating nutrients:', updatedNutrients);

        const foodDaySnapshot = await foodDayDocRef.get();
        if (!foodDaySnapshot.exists) return;

        const remainingFoodsSnapshot = await foodDayDocRef.collection('foods').get();

        if (remainingFoodsSnapshot.empty) {
            const clearedNutrients = {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0
            };
            await foodDayDocRef.update(clearedNutrients);
            console.log('Updated nutrients to 0');
            return;
        }

        await updateNutrients(updatedNutrients, formattedDate, userId);
        console.log('Updated nutrients');
    } catch (err) {
        console.error(err);
        throw new InternalError('Error deleting food item!');
    }
};

export default deleteFoodItem;
