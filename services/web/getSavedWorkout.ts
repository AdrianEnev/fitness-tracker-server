import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "../../config/firebaseConfig";
import type { Workout, Exercise, Set } from '../../config/interfaces';
import InternalError from "../../errors/custom_errors/InternalError";

export const getSavedWorkout = async (savedWorkoutId: string, currentUserUid: any): Promise<Workout | null> => {

    const usersCollectionRef = collection(FIRESTORE_DB, 'users');
    const userDocRef = doc(usersCollectionRef, currentUserUid);
    const savedWorkoutsCollectionRef = collection(userDocRef, 'saved_workouts');
    const savedWorkoutDocRef = doc(savedWorkoutsCollectionRef, savedWorkoutId);

    const savedWorkoutSnap = await getDoc(savedWorkoutDocRef);

    if (!savedWorkoutSnap.exists()) {
        console.log('No saved workout found, returning null');
        return null;
    }

    const savedWorkoutData = savedWorkoutSnap.data();
    const exercises: Exercise[] = [];

    const exercisesCollectionRef = collection(savedWorkoutDocRef, 'info');
    const exercisesSnapshot = await getDocs(exercisesCollectionRef);

    try{
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
    }catch (err) {
        throw new InternalError('Error handling exercises for saved workout')
    }

    return {
        ...savedWorkoutData,
        exercises,
        id: savedWorkoutSnap.id
    } as Workout;
}