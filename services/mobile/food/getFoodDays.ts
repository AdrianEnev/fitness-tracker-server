import { FIRESTORE_ADMIN } from '@config/firebaseConfig';

// Gets a snapshot of food day documents. Effective for updates but not for displaying info
const getFoodDays = async (userId: string) => {
    
    const userFoodDaysCollectionRef = FIRESTORE_ADMIN
        .collection('users')
        .doc(userId)
        .collection('food_days');

    const userFoodDaysSnapshot = await userFoodDaysCollectionRef.get();
    return userFoodDaysSnapshot;
};

export default getFoodDays;
