import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import { FIRESTORE_DB } from "../../../config/firebaseConfig";

// TESTED - everything here works (specifying just in case I forget)

// Deletes any subcollections of a given workout to avoid ghost documents inside firebase
const deleteSubcollections = async (docRef: any, batch: any) => {
    const subcollections = await getDocs(collection(docRef, 'info'));
    for (const subcollectionDoc of subcollections.docs) {
        const setsCollection = await getDocs(collection(subcollectionDoc.ref, 'sets'));
        for (const setDoc of setsCollection.docs) {
            batch.delete(setDoc.ref);
        }
        batch.delete(subcollectionDoc.ref);
    }
};

// Can be used to delete 1 or more workouts at a time
export const deleteWorkouts = async (
    selectedWorkouts: any,
    userId: any
) => {

    console.log('Running workout deletion...')

    const usersCollectionRef = collection(FIRESTORE_DB, 'users');
    const userDocRef = doc(usersCollectionRef, userId);
    const userWorkoutsCollectionRef = collection(userDocRef, 'workouts');

    const batch = writeBatch(FIRESTORE_DB);

    try {
        for (const selectedWorkout of selectedWorkouts) {
            const selectedWorkoutID = selectedWorkout.id;
            const selectedWorkoutDoc = doc(userWorkoutsCollectionRef, selectedWorkoutID);

            // Delete all subcollections and their documents
            await deleteSubcollections(selectedWorkoutDoc, batch);

            // Delete the workout document
            batch.delete(selectedWorkoutDoc);
            console.log(`Workout with ID ${selectedWorkoutID} added to batch for deletion`);
        }

        await batch.commit();
        console.log('Batch deletion committed');
    } catch (err) {
        console.error(err);
    }
};