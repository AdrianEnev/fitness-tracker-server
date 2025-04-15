import { FIREBASE_ADMIN, FIRESTORE_ADMIN } from "@config/firebaseConfig";

const decrementLungeCoins = async (amount: number, userId: string) => {

    console.log('Attempting to decrement lunge coins from user', userId);

    const userDocRef = FIRESTORE_ADMIN.collection('users').doc(userId);
    await userDocRef.update({
        lungeCoins: FIREBASE_ADMIN.firestore.FieldValue.increment(-amount)
    });

    console.log("Decremented lunge coins from user", userId, "amount:", amount);

}

export default decrementLungeCoins;