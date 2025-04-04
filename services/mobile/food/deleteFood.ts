import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../../../config/firebaseConfig";
import updateNutrients from "./updateFoodDayNutrients";
import ValidationError from "../../../errors/custom_errors/ValidationError";
import InternalError from "../../../errors/custom_errors/InternalError";

// Deletes specific food item by receiving the date of that item and the item itself
const deleteFoodItem = async (item: any, formattedDate: any, updatedNutrients: any, userId: string) => {

    console.log('Deleting item from date:', formattedDate);
    console.log('Item to delete:', item);

    if (!item || !formattedDate || !updatedNutrients) {
        throw new ValidationError('Invalid item/formattedDate/updatedNutrients passed to deleteFoodItem');
    }

    const usersCollectionRef = collection(FIRESTORE_DB, 'users');
    const userDocRef = doc(usersCollectionRef, userId);

    const foodDaysCollectionRef = collection(userDocRef, 'food_days');
    const foodDayDocRef = doc(foodDaysCollectionRef, formattedDate);
    const foodDayCollectionRef = collection(foodDayDocRef, 'foods');
        
    try {
        console.log('Deleting document with id:', item.id);

        const foodDocRef = doc(foodDayCollectionRef, item.id);
        await deleteDoc(foodDocRef);
        console.log('Food item deleted!')
        console.log('Recalculating nutrients:', updatedNutrients)

        const data = await getDocs(foodDaysCollectionRef);
        const matchingDoc = data.docs.find((doc) => doc.id === formattedDate);

        if (matchingDoc) {
            try {
                const data = await getDocs(foodDayCollectionRef);
    
                if (data.empty) {
                    const updatedNutrients = {
                        calories: 0,
                        protein: 0,
                        carbs: 0,
                        fat: 0
                    };
        
                    await updateDoc(foodDayDocRef, updatedNutrients);
                    console.log('Updated nutrients');
                    return;
                }

                updateNutrients(updatedNutrients, formattedDate, userId)
                console.log('Updated nutrients');
    
            } catch (err) {
                throw new InternalError('Error recalculating nutrients after deleting food item');
            }
        }
    } catch (err) {
        throw new InternalError('Error deleting food item!')
    }
}

export default deleteFoodItem;