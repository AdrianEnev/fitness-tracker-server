import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../../../config/firebaseConfig";
import getWorkouts from "./getWorkouts";

// Tested - works

// Sync workouts -> compare user Id firebase workouts to provided asyncstorage workouts and add any missing ones to firebase
const syncWorkouts = async (userId: string, parsedLocalWorkouts: any) => {

    console.log('Checking if workouts sync needed for user', userId)

    const usersCollectionRef = collection(FIRESTORE_DB, 'users');
    const userDocRef = doc(usersCollectionRef, userId);
    const userWorkoutsCollectionRef = collection(userDocRef, 'workouts');

    // Firebase workouts
    const firebaseWorkouts = await getWorkouts(userId);
    const numDatabaseWorkouts = firebaseWorkouts.size;

    // Local storage workouts
    const numLocalWorkouts = parsedLocalWorkouts.length;

    console.log('Firebase workouts: ', numDatabaseWorkouts)
    console.log('AsyncStorage workouts: ', numLocalWorkouts)

    if (numLocalWorkouts == 0) return;

    // Add missing workouts to firebase
    if (numLocalWorkouts > numDatabaseWorkouts) {

        console.log('Missing workouts in firebase')

        const missingWorkouts = parsedLocalWorkouts.filter((localWorkout: any) => {
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
                console.error('Error inside try block:', err);
            }
        });

        console.log('Workouts synced');
    }

}

const generateRandomColour = () => {

    const colours = ['[#fd3e54]', '[#3f8aff]', '[#15c48a]', '[#ffca2c]', '[#f053a3]', '[#9263fa]', '[#07c0da]'];
    const randomIndex = Math.floor(Math.random() * colours.length);
    return colours[randomIndex];
    
};


export default syncWorkouts;