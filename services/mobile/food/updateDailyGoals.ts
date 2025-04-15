import { GoalNutrients } from "@config/interfaces";
import { FIRESTORE_ADMIN } from '@config/firebaseConfig';
import InternalError from "@custom_errors/InternalError";

const updateDailyGoals = async (newNutrients: GoalNutrients, userId: string) => {

    console.log('Attempting to update daily goals for user:', userId);
    const nutrientsDocRef = FIRESTORE_ADMIN.collection('users').doc(userId).collection('user_info').doc('nutrients');

    try {
        await nutrientsDocRef.set({
            protein: newNutrients.protein,
            carbs: newNutrients.carbs,
            fat: newNutrients.fat,
            calories: newNutrients.calories,
        });        

        console.log('Daily goals updated successfully:', newNutrients);
    } catch (error: any) {
        throw new InternalError(error)
    }

}

export default updateDailyGoals;