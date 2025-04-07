import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../../config/firebaseConfig";
import InternalError from "../../errors/custom_errors/InternalError";

const syncNutrients = async (userId: string, localNutrients: any) => {
    
    console.log('Sync NUTRIENTS?', userId)

    if (!localNutrients) {
        throw new InternalError('No local nutrients to sync!');
    }

    try{
        const usersCollectionRef = collection(FIRESTORE_DB, 'users');
        const userDocRef = doc(usersCollectionRef, userId);
        const userInfoCollectionRef = collection(userDocRef, 'user_info');
        const nutrientsDocRef = doc(userInfoCollectionRef, 'nutrients');

        // Check if the nutrients document exists
        const nutrientsDocSnapshot = await getDoc(nutrientsDocRef);
        const remoteNutrients = nutrientsDocSnapshot.exists() ? nutrientsDocSnapshot.data() : null;    

        // Function to sort JSON object properties
        const sortObject = (obj: { [key: string]: any }) => {
            return Object.keys(obj).sort().reduce((result, key) => {
                result[key as keyof typeof result] = obj[key];
                return result;
            }, {} as { [key: string]: any });
        };

        // Compare local and remote nutrients
        if (localNutrients && (!remoteNutrients || JSON.stringify(sortObject(localNutrients)) !== JSON.stringify(sortObject(remoteNutrients)))) {
            await setDoc(nutrientsDocRef, localNutrients, { merge: true });
            console.log('Synced nutrients!');
            return;
        }

        console.log('No nutrients to sync!');
    }catch(err){
        throw new InternalError('Error syncing nutrients!');
    }
    
};

export default syncNutrients;