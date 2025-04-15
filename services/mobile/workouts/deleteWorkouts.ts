import InternalError from "@custom_errors/InternalError";
import { FIRESTORE_ADMIN } from '@config/firebaseConfig';
import BadRequestError from "@custom_errors/BadRequestError";

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
    workouts: any,
    userId: any
) => {

    if (!workouts) {
        throw new BadRequestError('No workouts to delete provided!');
    }

    const usersCollectionRef = FIRESTORE_ADMIN.collection('users');
    const userDocRef = usersCollectionRef.doc(userId);
    const userWorkoutsCollectionRef = userDocRef.collection('workouts');

    const batch = FIRESTORE_ADMIN.batch();

    try {
        for (const workout of workouts) {
            const workoutID = workout.id;
            const workoutDoc = userWorkoutsCollectionRef.doc(workoutID);

            // Delete all subcollections and their documents
            await deleteSubcollections(workoutDoc);

            // Delete the workout document
            batch.delete(workoutDoc);
            console.log(`Workout with ID ${workoutID} added to batch for deletion`);
        }

        await batch.commit();
        console.log('Workouts batch deletion committed');
    } catch (err) {
        throw new InternalError("Failed to delete workout/s");
    }
};