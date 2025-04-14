import ValidationError from "@custom_errors/ValidationError";
import InternalError from "@custom_errors/InternalError";
import { FIRESTORE_ADMIN } from '@config/firebaseConfig';

const addFoodItem = async (itemInfo: any, formattedDate: any, userId: string) => {
    console.log('Adding food item to ', formattedDate);
    console.log('Item info: ', itemInfo);

    if (!itemInfo || !formattedDate) {
        throw new ValidationError('Adding food item -> invalid item info/formatted date');
    }

    try {
        const foodDocRef = FIRESTORE_ADMIN
            .collection('users')
            .doc(userId)
            .collection('food_days')
            .doc(formattedDate)
            .collection('foods')
            .doc(itemInfo.id);

        await foodDocRef.set(itemInfo);
    } catch (err) {
        throw new InternalError('Error adding food item!');
    }

    console.log('Food successfully added!');
};

export default addFoodItem;
