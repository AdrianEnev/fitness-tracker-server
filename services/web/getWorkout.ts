import type { Workout, Exercise, Set } from '@config/interfaces';
import { FIRESTORE_ADMIN } from '@config/firebaseConfig';

export const getWorkout = async (workoutId: string, userId: any): Promise<Workout | null> => {

    //console.log('Attempting to retrieve workout...');
    const userDocRef = FIRESTORE_ADMIN.collection('users').doc(userId);
    const workoutDocRef = userDocRef.collection('workouts').doc(workoutId);

    const workoutSnap = await workoutDocRef.get();

    if (!workoutSnap.exists) {
        console.log('No workout found, returning null');
        return null;
    }

    const workoutData = workoutSnap.data();
    const exercises: Exercise[] = [];

    const exercisesCollectionRef = workoutDocRef.collection('info');
    const exercisesSnapshot = await exercisesCollectionRef.get();

    for (const exerciseDoc of exercisesSnapshot.docs) {
        const exerciseData = exerciseDoc.data();
        const sets: Set[] = [];

        const setsCollectionRef = exerciseDoc.ref.collection('sets');
        const setsSnapshot = await setsCollectionRef.get();

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

    return {
        ...workoutData,
        exercises,
        id: workoutSnap.id
    } as Workout;
}
