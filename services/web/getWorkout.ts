import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "../../config/firebaseConfig";
import type { Workout, Exercise, Set } from '../../config/interfaces';

export const getWorkout = async (workoutId: string, userId: any): Promise<Workout | null> => {

    const usersCollectionRef = collection(FIRESTORE_DB, 'users');
    const userDocRef = doc(usersCollectionRef, userId);
    const userWorkoutsCollectionRef = collection(userDocRef, 'workouts');
    const workoutDocRef = doc(userWorkoutsCollectionRef, workoutId)

    const workoutSnap = await getDoc(workoutDocRef);

    if (!workoutSnap.exists()) {
        console.log('No workout found, returning null');
        return null;
    }

    const workoutData = workoutSnap.data();
    const exercises: Exercise[] = [];

    const exercisesCollectionRef = collection(workoutDocRef, 'info');
    const exercisesSnapshot = await getDocs(exercisesCollectionRef);

    for (const exerciseDoc of exercisesSnapshot.docs) {
        const exerciseData = exerciseDoc.data();
        const sets: Set[] = [];

        const setsCollectionRef = collection(exerciseDoc.ref, 'sets');
        const setsSnapshot = await getDocs(setsCollectionRef);

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