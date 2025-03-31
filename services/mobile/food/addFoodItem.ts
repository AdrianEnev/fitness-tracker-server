import { collection, doc, setDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../../../config/firebaseConfig";

// TESTED - everything here works (specifying just in case I forget)

const addFoodItem = async (itemInfo: any, formattedDate: any, userId: string) => {

    console.log('Adding food item to ', formattedDate);
    console.log('Item info: ', itemInfo);

    const usersCollectionRef = collection(FIRESTORE_DB, 'users');
    const userDocRef = doc(usersCollectionRef, userId);
    const foodDaysCollectionRef = collection(userDocRef, 'food_days');  
    const foodDayDocRef = doc(foodDaysCollectionRef, formattedDate);
    const foodDayFoodsCollectionRef = collection(foodDayDocRef, 'foods');
    const foodDocRef = doc(foodDayFoodsCollectionRef, itemInfo.id);

    await setDoc(foodDocRef, itemInfo);
    console.log('Food successfuly added!')

}

export default addFoodItem;