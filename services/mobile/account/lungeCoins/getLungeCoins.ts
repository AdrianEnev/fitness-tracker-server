import { FIRESTORE_ADMIN } from '@config/firebaseConfig';

const getLungeCoins = async (userId: string) => {
    
    console.log('Attempting to retreive lunge coins for user', userId);

    const userDocRef = FIRESTORE_ADMIN.collection('users').doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
        console.log('User does not exist');
        return 0;
    }

    console.log("result: ", userDoc.data()?.lungeCoins || 0);
    return userDoc.data()?.lungeCoins || 0;

}

export default getLungeCoins;