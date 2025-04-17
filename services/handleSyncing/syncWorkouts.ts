import getWorkouts from "../mobile/workouts/getWorkouts";
import { generateRandomColour } from "../../utils/generateRandomColour";
import InternalError from "@custom_errors/InternalError";
import { FIRESTORE_ADMIN, FIREBASE_ADMIN } from '@config/firebaseConfig';

const syncWorkouts = async (userId: string, localWorkouts: any) => {

    //console.log('Attempting to sync workouts for', userId);

    if (!localWorkouts) {
        throw new InternalError("No workouts provided to sync!");
    }

    const numLocalWorkouts = localWorkouts.length;

    if (numLocalWorkouts === 0) {
        //console.log('No workouts to sync!');
        return;
    }

    const userDocRef = FIRESTORE_ADMIN.collection('users').doc(userId);
    const userWorkoutsCollectionRef = userDocRef.collection('workouts');

    // Get workouts from Firestore
    const firebaseWorkouts = await getWorkouts(userId);
    const numDatabaseWorkouts = firebaseWorkouts.size;

    //console.log('Firebase workouts: ', numDatabaseWorkouts);
    //console.log('AsyncStorage workouts: ', numLocalWorkouts);

    if (numLocalWorkouts > numDatabaseWorkouts) {
        console.log('Adding missing workouts to firebase...');

        const missingWorkouts = localWorkouts.filter((localWorkout: any) => {
            return !firebaseWorkouts.docs.some((doc) => doc.id === localWorkout.id);
        });

        for (const workout of missingWorkouts) {
            const workoutDocRef = userWorkoutsCollectionRef.doc(workout.id);

            await workoutDocRef.set({
                title: workout.title?.trim() || 'Untitled Workout',
                created: workout.created || FIREBASE_ADMIN.firestore.Timestamp.now(),
                colour: workout.colour || generateRandomColour(),
                numberOfExercises: workout.numberOfExercises || 0
            });

            const workoutInfoCollectionRef = workoutDocRef.collection("info");

            try {
                for (const exercise of workout.info || []) {
                    for (const [index, set] of (exercise.sets || []).entries()) {
                        if (exercise.title === '') {
                            exercise.title = "Exercise " + (exercise.exerciseIndex);
                        }

                        const exerciseDocRef = workoutInfoCollectionRef.doc(exercise.exerciseIndex.toString());

                        await exerciseDocRef.set({
                            title: exercise.title.trim(),
                            exerciseIndex: exercise.exerciseIndex,
                        });

                        const exerciseSets = exerciseDocRef.collection("sets");

                        await exerciseSets.add({
                            reps: set.reps,
                            weight: set.weight,
                            intensity: set.intensity || null,
                            setIndex: index + 1
                        });
                    }
                }

                console.log('Added workout successfully, id:', workout.id);
            } catch (err) {
                throw new InternalError("Failed to sync workout details");
            }
        }

        console.log('Workouts synced');
    }
};

export default syncWorkouts;
