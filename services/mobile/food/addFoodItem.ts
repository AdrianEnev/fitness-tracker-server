import { collection, doc, setDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../../../config/firebaseConfig";
import ValidationError from "../../../errors/custom_errors/ValidationError";
import InternalError from "../../../errors/custom_errors/InternalError";

const addFoodItem = async (itemInfo: any, formattedDate: any, userId: string) => {

    console.log('Adding food item to ', formattedDate);
    console.log('Item info: ', itemInfo);

    if (!itemInfo || !formattedDate) {
        throw new ValidationError('Adding food item -> invalid item info/formatted date')
    }

    try {
        const usersCollectionRef = collection(FIRESTORE_DB, 'users');
        const userDocRef = doc(usersCollectionRef, userId);
        const foodDaysCollectionRef = collection(userDocRef, 'food_days');  
        const foodDayDocRef = doc(foodDaysCollectionRef, formattedDate);
        const foodDayFoodsCollectionRef = collection(foodDayDocRef, 'foods');
        const foodDocRef = doc(foodDayFoodsCollectionRef, itemInfo.id);

        await setDoc(foodDocRef, itemInfo);
    }catch (err) {
        throw new InternalError('Error adding food item!');
    }
    
    console.log('Food successfuly added!')

}

export default addFoodItem;