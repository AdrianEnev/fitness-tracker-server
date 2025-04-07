import { addDoc, collection, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../../config/firebaseConfig";
import InternalError from "../../errors/custom_errors/InternalError";

const syncSavedWorkouts = async (userId: string, localSavedWorkouts: any) => {

    console.log('Sync SAVED WORKOUTS?...', userId)

    if (!localSavedWorkouts) {
        throw new InternalError('No saved workouts to sync!');
    }

    // Reference to the user's collection in Firestore
    const usersCollectionRef = collection(FIRESTORE_DB, 'users');
    const userDocRef = doc(usersCollectionRef, userId);
    const userSavedWorkoutsCollectionRef = collection(userDocRef, 'saved_workouts');

    // Get the user's saved workouts from Firestore
    const userSavedWorkoutsSnapshot = await getDocs(userSavedWorkoutsCollectionRef);
    const numDatabaseSavedWorkouts = userSavedWorkoutsSnapshot.size;

    const numLocalSavedWorkouts = localSavedWorkouts.length;

    if (numLocalSavedWorkouts <= numDatabaseSavedWorkouts) {
        console.log('No saved workouts to sync!');
        return
    }

    // If there are more saved workouts locally than in the database, sync them
    const missingSavedWorkouts = localSavedWorkouts.filter((localSavedWorkout: any) => {
        return !userSavedWorkoutsSnapshot.docs.some((doc) => doc.id === localSavedWorkout.id);
    });

    // Add missing workouts to Firestore
    missingSavedWorkouts.forEach(async (savedWorkout: any) => {
        const savedWorkoutDocRef = doc(userSavedWorkoutsCollectionRef, savedWorkout.id);

        await setDoc(savedWorkoutDocRef, {
            title: savedWorkout.title?.trim() || 'Untitled Workout',
            created: savedWorkout.created || serverTimestamp(),
            duration: savedWorkout.duration || null,
        });
        const savedWorkoutInfoCollectionRef = collection(savedWorkoutDocRef, "info");

        try {
            // Add exercises and sets to Firestore
            savedWorkout.exercises?.forEach((exercise: any) => {
                exercise.sets?.forEach(async (set: any, index: any) => {
                    if (exercise.title === '') {
                        exercise.title = "Exercise " + (exercise.exerciseIndex);
                    }
                    const exerciseDocRef = doc(savedWorkoutInfoCollectionRef, (exercise.exerciseIndex).toString());

                    await setDoc(exerciseDocRef, {
                        title: exercise.title.trim(),
                        exerciseIndex: exercise.exerciseIndex,
                        description: exercise.description || "",
                        note: exercise.note || "",
                    });

                    const exerciseSets = collection(exerciseDocRef, "sets");

                    await addDoc(exerciseSets, {
                        reps: set.reps,
                        weight: set.weight,
                        intensity: set.intensity ? set.intensity : null,
                        setIndex: index + 1
                    });
                });
            });
        } catch (err) {
            throw new InternalError('Error syncing saved workouts');
        }
    });

    console.log('Saved workouts synced');

};

export default syncSavedWorkouts;