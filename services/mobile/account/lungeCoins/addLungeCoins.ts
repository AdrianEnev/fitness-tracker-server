import { FIREBASE_ADMIN, FIRESTORE_ADMIN } from "@config/firebaseConfig";

const addLungeCoins = async (amount: number, userId: string) => {

    console.log('Attempting to add lunge coins to user', userId);

    const userDocRef = FIRESTORE_ADMIN.collection('users').doc(userId);
    await userDocRef.update({
        lungeCoins: FIREBASE_ADMIN.firestore.FieldValue.increment(amount)
    });

    console.log("Added lunge coins to user", userId, "amount:", amount);

}

export default addLungeCoins;