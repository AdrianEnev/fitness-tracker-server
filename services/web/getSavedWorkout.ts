import type { Workout, Exercise, Set } from '@config/interfaces';
import InternalError from "@custom_errors/InternalError";
import { FIRESTORE_ADMIN } from '@config/firebaseConfig';

export const getSavedWorkout = async (savedWorkoutId: string, currentUserUid: any): Promise<Workout | null> => {
    
    //console.log('Attempting to retrieve saved workout...');
    const userDocRef = FIRESTORE_ADMIN.collection('users').doc(currentUserUid);
    const savedWorkoutDocRef = userDocRef.collection('saved_workouts').doc(savedWorkoutId);

    const savedWorkoutSnap = await savedWorkoutDocRef.get();

    if (!savedWorkoutSnap.exists) {
        console.log('No saved workout found, returning null');
        return null;
    }

    const savedWorkoutData = savedWorkoutSnap.data();
    const exercises: Exercise[] = [];

    const exercisesSnapshot = await savedWorkoutDocRef.collection('info').get();

    try {
        for (const exerciseDoc of exercisesSnapshot.docs) {
            const exerciseData = exerciseDoc.data();
            const sets: Set[] = [];

            const setsSnapshot = await exerciseDoc.ref.collection('sets').get();

            for (const setDoc of setsSnapshot.docs) {
                sets.push({
                    ...setDoc.data(),
                    id: setDoc.id
                } as Set);
            }

            exercises.push({
                ...exerciseData,
                sets,
                id: exerciseDoc.id
            } as Exercise);
        }
    } catch (err) {
        throw new InternalError('Error handling exercises for saved workout');
    }

    return {
        ...savedWorkoutData,
        exercises,
        id: savedWorkoutSnap.id
    } as Workout;
};
