import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../../config/firebaseConfig";
import getWorkouts from "../mobile/workouts/getWorkouts";
import { generateRandomColour } from "../generateRandomColour";
import InternalError from "../../errors/custom_errors/InternalError";

// Sync workouts -> compare user Id firebase workouts to provided asyncstorage workouts and add any missing ones to firebase
const syncWorkouts = async (userId: string, localWorkouts: any) => {

    console.log('Sync WORKOUTS?...', userId)

    if (!localWorkouts) {
        throw new InternalError("No workouts provided to sync!");
    }

    // Local storage workouts
    const numLocalWorkouts = localWorkouts.length;

    // 0 workouts stored locally -> nothing to sync
    if (numLocalWorkouts == 0) {
        console.log('No workouts to sync!')
        return;
    }

    const usersCollectionRef = collection(FIRESTORE_DB, 'users');
    const userDocRef = doc(usersCollectionRef, userId);
    const userWorkoutsCollectionRef = collection(userDocRef, 'workouts');

    // Firebase workouts
    const firebaseWorkouts = await getWorkouts(userId);
    const numDatabaseWorkouts = firebaseWorkouts.size;

    console.log('Firebase workouts: ', numDatabaseWorkouts)
    console.log('AsyncStorage workouts: ', numLocalWorkouts)

    // Add missing workouts to firebase
    if (numLocalWorkouts > numDatabaseWorkouts) {

        console.log('Adding missing workouts to firebase...')

        const missingWorkouts = localWorkouts.filter((localWorkout: any) => {
            return !firebaseWorkouts.docs.some((doc) => doc.id === localWorkout.id);
        });

        // Add missing workouts to Firestore
        missingWorkouts.forEach(async (workout: any) => {
            const workoutDocRef = doc(userWorkoutsCollectionRef, workout.id);

            await setDoc(workoutDocRef, {
                title: workout.title?.trim() || 'Untitled Workout',
                created: workout.created || serverTimestamp(),
                colour: workout.colour || generateRandomColour(),
                numberOfExercises: workout.numberOfExercises || 0
            });

            // Add workout info to Firestore
            const workoutInfoCollectionRef = collection(workoutDocRef, "info");

            try {
                workout.info?.forEach((exercise: any) => {
                    exercise.sets?.forEach(async (set: any, index: any) => {
                        if (exercise.title === '') {
                            exercise.title = "Exercise " + (exercise.exerciseIndex);
                        }
                        const exerciseDocRef = doc(workoutInfoCollectionRef, (exercise.exerciseIndex).toString());

                        await setDoc(exerciseDocRef, {
                            title: exercise.title.trim(),
                            exerciseIndex: exercise.exerciseIndex,
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

                console.log('Added workout successfuly, id:', workout.id)
            } catch (err) {
                throw new InternalError("Failed to sync workout details");
            }
        });

        console.log('Workouts synced');
    }

}

export default syncWorkouts;