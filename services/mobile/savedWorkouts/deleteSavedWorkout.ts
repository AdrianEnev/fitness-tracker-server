import { FIRESTORE_ADMIN } from "@config/firebaseConfig";
import InternalError from "@custom_errors/InternalError";

const deleteSubcollections = async (docRef: FirebaseFirestore.DocumentReference) => {

    const infoSubcollection = await docRef.collection('info').get();

    for (const subDoc of infoSubcollection.docs) {
        const setsCollection = await subDoc.ref.collection('sets').get();

        for (const setDoc of setsCollection.docs) {
            await setDoc.ref.delete();
        }

        await subDoc.ref.delete();
    }
    
};

const deleteSavedWorkout = async (savedWorkoutId: string, userId: string) => {

    console.log('Attempting to delete saved workout:', savedWorkoutId, 'for user:', userId);

    try {
        const workoutDocRef = FIRESTORE_ADMIN
        .collection('users')
        .doc(userId)
        .collection('saved_workouts')
        .doc(savedWorkoutId);

        const workoutDocSnapshot = await workoutDocRef.get();

        if (workoutDocSnapshot.exists) {
            await deleteSubcollections(workoutDocRef);
            await workoutDocRef.delete();
            console.log('Successfuly deleted saved workout!')
        }
    }catch (error: any) {
        throw new InternalError('Error deleting saved workout: ' + error)
    }
    
};

export default deleteSavedWorkout;
