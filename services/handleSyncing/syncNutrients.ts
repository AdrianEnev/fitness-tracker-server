import InternalError from "@custom_errors/InternalError";

// Initialize Firestore
import { FIRESTORE_ADMIN } from '@config/firebaseConfig';

const syncNutrients = async (userId: string, localNutrients: any) => {
    
    //console.log('Attempting to sync nutrients for', userId);

    if (!localNutrients) {
        throw new InternalError('No local nutrients to sync!');
    }

    try {
        const userDocRef = FIRESTORE_ADMIN.collection('users').doc(userId);
        const userInfoCollectionRef = userDocRef.collection('user_info');
        const nutrientsDocRef = userInfoCollectionRef.doc('nutrients');

        const nutrientsDocSnapshot = await nutrientsDocRef.get();
        const remoteNutrients = nutrientsDocSnapshot.exists ? nutrientsDocSnapshot.data() : null;

        const sortObject = (obj: { [key: string]: any }) => {
            return Object.keys(obj)
                .sort()
                .reduce((result, key) => {
                    result[key as keyof typeof result] = obj[key];
                    return result;
                }, {} as { [key: string]: any });
        };

        if (localNutrients && (!remoteNutrients || JSON.stringify(sortObject(localNutrients)) !== JSON.stringify(sortObject(remoteNutrients)))) {
            await nutrientsDocRef.set(localNutrients, { merge: true });
            console.log('Synced nutrients!');
            return;
        }

        //console.log('No nutrients to sync!');
    } catch (err) {
        throw new InternalError('Error syncing nutrients!');
    }
};

export default syncNutrients;