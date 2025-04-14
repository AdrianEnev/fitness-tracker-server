import admin from "firebase-admin";
import InternalError from "@custom_errors/InternalError";

import { FIRESTORE_ADMIN } from '@config/firebaseConfig';

const syncSavedWorkouts = async (userId: string, localSavedWorkouts: any) => {

    console.log('Attempting to sync saved workouts for', userId)

    if (!localSavedWorkouts) {
        throw new InternalError('No saved workouts to sync!');
    }

    const userDocRef = FIRESTORE_ADMIN.collection('users').doc(userId);
    const userSavedWorkoutsCollectionRef = userDocRef.collection('saved_workouts');

    // Get the user's saved workouts from Firestore
    const userSavedWorkoutsSnapshot = await userSavedWorkoutsCollectionRef.get();
    const numDatabaseSavedWorkouts = userSavedWorkoutsSnapshot.size;

    const numLocalSavedWorkouts = localSavedWorkouts.length;

    if (numLocalSavedWorkouts <= numDatabaseSavedWorkouts) {
        console.log('No saved workouts to sync!');
        return;
    }

    // Filter out workouts that already exist in Firestore
    const missingSavedWorkouts = localSavedWorkouts.filter((localSavedWorkout: any) => {
        return !userSavedWorkoutsSnapshot.docs.some((doc) => doc.id === localSavedWorkout.id);
    });

    for (const savedWorkout of missingSavedWorkouts) {
        const savedWorkoutDocRef = userSavedWorkoutsCollectionRef.doc(savedWorkout.id);

        await savedWorkoutDocRef.set({
            title: savedWorkout.title?.trim() || 'Untitled Workout',
            created: savedWorkout.created || admin.firestore.FieldValue.serverTimestamp(),
            duration: savedWorkout.duration || null,
        });

        const savedWorkoutInfoCollectionRef = savedWorkoutDocRef.collection("info");

        try {
            for (const exercise of savedWorkout.exercises || []) {
                for (const [index, set] of (exercise.sets || []).entries()) {

                    if (exercise.title === '') {
                        exercise.title = "Exercise " + (exercise.exerciseIndex);
                    }

                    const exerciseDocRef = savedWorkoutInfoCollectionRef.doc(exercise.exerciseIndex.toString());

                    await exerciseDocRef.set({
                        title: exercise.title.trim(),
                        exerciseIndex: exercise.exerciseIndex,
                        description: exercise.description || "",
                        note: exercise.note || "",
                    });

                    const exerciseSets = exerciseDocRef.collection("sets");

                    await exerciseSets.add({
                        reps: set.reps,
                        weight: set.weight,
                        intensity: set.intensity || null,
                        setIndex: index + 1,
                    });
                }
            }
        } catch (err) {
            throw new InternalError('Error syncing saved workouts');
        }
    }

    console.log('Saved workouts synced');
};

export default syncSavedWorkouts;
