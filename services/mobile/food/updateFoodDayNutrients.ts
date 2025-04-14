import { FIRESTORE_ADMIN } from '@config/firebaseConfig';

// Update the nutrients of a specific food day
const updateNutrients = async (updatedNutrients: any, formattedDate: any, userId: string) => {
    
    console.log('Updating nutrients for day: ', formattedDate);
    console.log('New nutrients: ', updatedNutrients);

    const foodDayDocRef = FIRESTORE_ADMIN
        .collection('users')
        .doc(userId)
        .collection('food_days')
        .doc(formattedDate);

    const docSnapshot = await foodDayDocRef.get();

    if (docSnapshot.exists) {
        await foodDayDocRef.update(updatedNutrients);
    } else {
        await foodDayDocRef.set(updatedNutrients);
    }
};

export default updateNutrients;
