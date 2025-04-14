import InternalError from "@custom_errors/InternalError";
import { FIRESTORE_ADMIN } from '@config/firebaseConfig';

// Deletes any subcollections of a given workout to avoid ghost documents inside firebase
const deleteSubcollections = async (docRef: any) => {
    const subcollectionsSnapshot = await FIRESTORE_ADMIN.collection(docRef.path + '/info').get();

    try {
        subcollectionsSnapshot.forEach(async subcollectionDoc => {
            const setsCollection = await subcollectionDoc.ref.collection('sets').get();
            
            const batch = FIRESTORE_ADMIN.batch(); // Create a new batch for each subcollection

            setsCollection.forEach(setDoc => {
                batch.delete(setDoc.ref);
            });
            batch.delete(subcollectionDoc.ref);

            await batch.commit(); // Commit the batch for the subcollection
        });
    } catch (err) {
        throw new InternalError('Error deleting subcollections (deleteWorkout/s)');
    }
};

// Can be used to delete 1 or more workouts at a time
export const deleteWorkouts = async (
    selectedWorkouts: any,
    userId: any
) => {
    console.log('Running workout deletion...')

    const usersCollectionRef = FIRESTORE_ADMIN.collection('users');
    const userDocRef = usersCollectionRef.doc(userId);
    const userWorkoutsCollectionRef = userDocRef.collection('workouts');

    const batch = FIRESTORE_ADMIN.batch();

    try {
        for (const selectedWorkout of selectedWorkouts) {
            const selectedWorkoutID = selectedWorkout.id;
            const selectedWorkoutDoc = userWorkoutsCollectionRef.doc(selectedWorkoutID);

            // Delete all subcollections and their documents
            await deleteSubcollections(selectedWorkoutDoc);

            // Delete the workout document
            batch.delete(selectedWorkoutDoc);
            console.log(`Workout with ID ${selectedWorkoutID} added to batch for deletion`);
        }

        await batch.commit();
        console.log('Batch deletion committed');
    } catch (err) {
        throw new InternalError("Failed to delete workout/s");
    }
};