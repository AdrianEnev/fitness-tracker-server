import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../../../config/firebaseConfig";
import updateNutrients from "./updateFoodDayNutrients";

// TESTED - everything here works (specifying just in case I forget)

// Deletes specific food item by receiving the date of that item and the item itself
const deleteFoodItem = async (item: any, formattedDate: any, updatedNutrients: any, userId: string) => {

    console.log('Deleting item from date:', formattedDate);
    console.log('Item to delete:', item);

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
                    return
                }

                updateNutrients(updatedNutrients, formattedDate, userId)
                console.log('Updated nutrients');
    
            } catch (err) {
                console.error(err);
            }
        }
        
    } catch (err) {
        console.error(err);
    }
}

export default deleteFoodItem;